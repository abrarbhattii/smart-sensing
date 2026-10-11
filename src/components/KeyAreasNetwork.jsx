import { Fragment, useMemo, useState } from 'react';
import './KeyAreasNetwork.css';

/** Hex rows alternate 2 and 3 nodes; offset rows sit between the hexes above. */
const ROW_SIZES = [2, 3];

/** Two-line hex label. "&" stays with the first line for nodes and starts the second line for pillars. */
function splitLabel(text, ampersandStartsLine) {
    const words = String(text).split(/\s+/).filter(Boolean);
    if (words.length < 2)
        return [String(text)];
    const amp = words.indexOf('&');
    let cut;
    if (amp > 0 && amp < words.length - 1) {
        cut = ampersandStartsLine ? amp : amp + 1;
    }
    else {
        cut = 1;
        let best = Infinity;
        for (let i = 1; i < words.length; i += 1) {
            const diff = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length);
            if (diff < best) {
                best = diff;
                cut = i;
            }
        }
    }
    return [words.slice(0, cut).join(' '), words.slice(cut).join(' ')];
}

function toRows(nodes) {
    const rows = [];
    let i = 0;
    while (i < nodes.length) {
        const size = ROW_SIZES[rows.length % ROW_SIZES.length];
        rows.push({ offset: rows.length % 2 === 1, nodes: nodes.slice(i, i + size) });
        i += size;
    }
    return rows;
}

const DEFAULT_DETAIL = {
    icon: null,
    color: null,
    title: 'Select a node',
    desc: 'Click any topic to explore that research area.',
    tags: [],
};

function Lines({ lines }) {
    return lines.map((line, i) => (
      <Fragment key={line}>
        {i > 0 ? <br /> : null}
        {line}
      </Fragment>
    ));
}

function activateOnKey(handler) {
    return (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handler();
        }
    };
}

export function KeyAreasNetwork({ pillars = [], nodes = [] }) {
    const [selection, setSelection] = useState(null);
    const PILLARS = useMemo(() => pillars.map((p) => ({
        domain: p.id,
        icon: p.icon,
        label: p.label,
        lines: splitLabel(p.label, true),
    })), [pillars]);
    const NODE_ROWS = useMemo(() => toRows(nodes.map((n) => ({
        ...n,
        domains: n.domains || [],
        lines: splitLabel(n.title, false),
    }))), [nodes]);
    const ALL_NODES = NODE_ROWS.flatMap((row) => row.nodes);

    const activeNode = selection?.type === 'node' ? ALL_NODES.find((n) => n.id === selection.id) : null;
    const activePillar = selection?.type === 'pillar' ? selection.id : null;

    const toggle = (type, id) => {
        setSelection((current) => (current?.type === type && current.id === id ? null : { type, id }));
    };

    const pillarState = (domain) => {
        if (activeNode)
            return activeNode.domains.includes(domain) ? 'active' : 'dim';
        if (activePillar)
            return activePillar === domain ? 'active' : 'dim';
        return '';
    };

    const nodeState = (node) => {
        if (activeNode) {
            if (node.id === activeNode.id)
                return 'active';
            return node.domains.some((d) => activeNode.domains.includes(d)) ? '' : 'dim';
        }
        if (activePillar)
            return node.domains.includes(activePillar) ? 'active' : 'dim';
        return '';
    };

    let detail = DEFAULT_DETAIL;
    const pillarInfo = activePillar ? PILLARS.find((p) => p.domain === activePillar) : null;
    if (activeNode) {
        detail = { icon: activeNode.icon, color: activeNode.color, title: activeNode.title, desc: activeNode.desc, tags: activeNode.tags || [] };
    }
    else if (pillarInfo) {
        const info = pillarInfo;
        detail = {
            icon: info.icon,
            color: '#ed8936',
            title: info.label,
            desc: `Showing all research areas connected to ${info.label}. Click any highlighted hexagon for details.`,
            tags: [],
        };
    }

    return (<div className="ka-root">
      <p className="ka-intro">
        Key focus areas guiding our research and development activities
      </p>
      <div className="ka-wrapper">
      <div className="ka-pillars" id="ka-pillars">
        {PILLARS.map((pillar) => {
            const state = pillarState(pillar.domain);
            return (<div key={pillar.domain} className={`ka-pillar${state ? ` ka-pillar--${state}` : ''}`} data-domain={pillar.domain} role="button" tabIndex={0} aria-pressed={activePillar === pillar.domain} onClick={() => toggle('pillar', pillar.domain)} onKeyDown={activateOnKey(() => toggle('pillar', pillar.domain))}>
              <div className="ka-pillar-hex">
                <i className={`fas ${pillar.icon}`} aria-hidden="true"/>
                <span><Lines lines={pillar.lines}/></span>
              </div>
            </div>);
        })}
      </div>

      <div className="ka-center-wrap">
        <div className="ka-cluster" id="ka-cluster">
          {NODE_ROWS.map((row) => (<div key={row.nodes[0].id} className={`ka-hex-row${row.offset ? ' ka-hex-row--offset' : ''}`}>
              {row.nodes.map((node) => {
                const state = nodeState(node);
                return (<div key={node.id} className={`ka-node${state ? ` ka-node--${state}` : ''}`} data-id={node.id} data-domains={node.domains.join(',')} role="button" tabIndex={state === 'dim' ? -1 : 0} aria-pressed={activeNode?.id === node.id} onClick={() => toggle('node', node.id)} onKeyDown={activateOnKey(() => toggle('node', node.id))}>
                    <div className="ka-node-inner">
                      <i className={`fas ${node.icon}`} aria-hidden="true"/>
                      <span><Lines lines={node.lines}/></span>
                    </div>
                  </div>);
              })}
            </div>))}
        </div>
      </div>

      <div className={`ka-detail${selection ? ' ka-detail--active' : ''}`} id="ka-detail" aria-live="polite">
        <div className="ka-detail-icon" id="ka-detail-icon">
          {detail.icon ? <i className={`fas ${detail.icon}`} style={{ color: detail.color }} aria-hidden="true"/> : null}
        </div>
        <h3 id="ka-detail-title">{detail.title}</h3>
        <p id="ka-detail-desc">{detail.desc}</p>
        <div className="ka-detail-tags" id="ka-detail-tags">
          {detail.tags.map((t) => (<span key={t} className="ka-tag">
              {t}
            </span>))}
        </div>
      </div>
      </div>
    </div>);
}
