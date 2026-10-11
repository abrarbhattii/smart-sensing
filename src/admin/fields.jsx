import { useEffect, useId, useState } from 'react';
import { useController } from 'react-hook-form';
import { imageUrl } from '../utils/imageUrl';
import { listOptions, uploadFile, uploadImage } from './adminApi';

const optionsCache = new Map();

function useRefOptions(field) {
    const cacheKey = field.type === 'ref' ? `${field.table}:${field.labelColumn}:${field.valueColumn}` : null;
    const [options, setOptions] = useState(() => (cacheKey && optionsCache.get(cacheKey)) || []);
    useEffect(() => {
        if (!cacheKey)
            return undefined;
        let cancelled = false;
        listOptions(field.table, field.labelColumn, field.valueColumn)
            .then((list) => {
                optionsCache.set(cacheKey, list);
                if (!cancelled)
                    setOptions(list);
            })
            .catch(() => { });
        return () => {
            cancelled = true;
        };
    }, [cacheKey, field.table, field.labelColumn, field.valueColumn]);
    return options;
}

function ImageInput({ id, value, onChange, folder, disabled }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const onFile = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file)
            return;
        setBusy(true);
        setError('');
        try {
            onChange(await uploadImage(file, folder));
        }
        catch (err) {
            setError(err.message);
        }
        setBusy(false);
    };

    return (
      <div className="admin-image-field">
        <div className="admin-image-field__preview">
          {value ? <img src={imageUrl(value)} alt=""/> : <span className="text-muted small">No image</span>}
        </div>
        <div className="flex-grow-1">
          <input id={id} type="text" className="form-control form-control-sm mb-2" placeholder="Image URL, or /src/images/... for an image bundled with the site" value={value || ''} disabled={disabled} onChange={(e) => onChange(e.target.value)}/>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <label className={`btn btn-sm btn-outline-primary mb-0${busy || disabled ? ' disabled' : ''}`}>
              {busy ? 'Uploading…' : 'Upload image'}
              <input type="file" accept="image/*" hidden onChange={onFile} disabled={busy || disabled}/>
            </label>
            {value ? <button type="button" className="btn btn-sm btn-link text-danger" onClick={() => onChange('')}>Remove</button> : null}
            <span className="small text-muted">JPG/PNG are resized and converted to WebP. GIF and SVG upload as-is.</span>
          </div>
          {error ? <div className="text-danger small mt-1">{error}</div> : null}
        </div>
      </div>
    );
}

function FileInput({ id, value, onChange, folder, disabled }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const onFile = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file)
            return;
        setBusy(true);
        setError('');
        try {
            onChange(await uploadFile(file, folder));
        }
        catch (err) {
            setError(err.message);
        }
        setBusy(false);
    };

    return (
      <div>
        <input id={id} type="text" className="form-control form-control-sm mb-2" placeholder="File URL (upload, or paste a Google Drive / Zenodo link)" value={value || ''} disabled={disabled} onChange={(e) => onChange(e.target.value)}/>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <label className={`btn btn-sm btn-outline-primary mb-0${busy || disabled ? ' disabled' : ''}`}>
            {busy ? 'Uploading…' : 'Upload file'}
            <input type="file" hidden onChange={onFile} disabled={busy || disabled}/>
          </label>
          {value ? <a href={value} target="_blank" rel="noopener noreferrer" className="small">Open</a> : null}
          <span className="small text-muted">Uploaded as-is. Zip shapefiles first. Max 50 MB; use an external link for bigger datasets.</span>
        </div>
        {error ? <div className="text-danger small mt-1">{error}</div> : null}
      </div>
    );
}

/** One form control bound to react-hook-form, rendered according to field.type. */
export function FieldInput({ control, name, field, folder, disabled = false, compact = false }) {
    const id = useId();
    const { field: input, fieldState } = useController({ control, name });
    const options = useRefOptions(field);
    const invalid = fieldState.error ? ' is-invalid' : '';
    const size = compact ? ' form-control-sm' : '';
    const selectSize = compact ? ' form-select-sm' : '';

    let control_;
    switch (field.type) {
        case 'textarea':
            control_ = <textarea id={id} className={`form-control${size}${invalid}`} rows={field.rows || 3} disabled={disabled} {...input} value={input.value ?? ''}/>;
            break;
        case 'checkbox':
            control_ = (
              <div className="form-check form-switch">
                <input id={id} type="checkbox" className="form-check-input" role="switch" disabled={disabled} checked={Boolean(input.value)} onChange={(e) => input.onChange(e.target.checked)} onBlur={input.onBlur}/>
                <label className="form-check-label" htmlFor={id}>{field.label}</label>
              </div>
            );
            break;
        case 'select':
            control_ = (
              <select id={id} className={`form-select${selectSize}${invalid}`} disabled={disabled} {...input} value={input.value ?? ''}>
                {field.required || field.options.some(([v]) => v === '') ? null : <option value="">—</option>}
                {field.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            );
            break;
        case 'ref':
            control_ = (
              <select id={id} className={`form-select${selectSize}${invalid}`} disabled={disabled} {...input} value={input.value ?? ''}>
                <option value="">Select…</option>
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                {input.value && !options.some((o) => o.value === input.value) ? <option value={input.value}>{input.value}</option> : null}
              </select>
            );
            break;
        case 'image':
            control_ = <ImageInput id={id} value={input.value} onChange={input.onChange} folder={folder} disabled={disabled}/>;
            break;
        case 'file':
            control_ = <FileInput id={id} value={input.value} onChange={input.onChange} folder={folder} disabled={disabled}/>;
            break;
        case 'color':
            control_ = (
              <div className="d-flex gap-2 align-items-center">
                <input type="color" className="form-control form-control-color" disabled={disabled} value={input.value || '#000000'} onChange={(e) => input.onChange(e.target.value)} aria-label={field.label}/>
                <input id={id} type="text" className={`form-control${size}${invalid}`} style={{ maxWidth: 140 }} disabled={disabled} {...input} value={input.value ?? ''}/>
              </div>
            );
            break;
        case 'icon': {
            const cls = String(input.value || '');
            const preview = cls && !/\bfa[srb]?\b|\bfa-(solid|regular|brands)\b/.test(cls) ? `fas ${cls}` : cls;
            control_ = (
              <div className="input-group">
                <span className="input-group-text admin-icon-preview">{cls ? <i className={preview} aria-hidden="true"/> : null}</span>
                <input id={id} type="text" className={`form-control${size}${invalid}`} placeholder="fas fa-leaf" disabled={disabled} {...input} value={input.value ?? ''}/>
              </div>
            );
            break;
        }
        default: {
            const type = field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'url' ? 'text' : 'text';
            control_ = <input id={id} type={type} step={field.step} className={`form-control${size}${invalid}`} placeholder={field.placeholder} disabled={disabled} {...input} value={input.value ?? ''}/>;
        }
    }

    if (field.type === 'checkbox')
        return <div className={compact ? '' : 'mb-3'}>{control_}</div>;

    return (
      <div className={compact ? 'admin-child-field' : 'mb-3'}>
        <label className={`form-label${compact ? ' small mb-1' : ''}`} htmlFor={id}>
          {field.label}{field.required ? <span className="text-danger"> *</span> : null}
        </label>
        {control_}
        {fieldState.error ? <div className="invalid-feedback d-block">{fieldState.error.message}</div> : null}
      </div>
    );
}
