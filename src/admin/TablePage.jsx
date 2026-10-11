import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateContent } from '../content/useContent';
import { deleteRecord, listOptions, listRows, saveOrder, setPublished } from './adminApi';
import { RecordForm } from './RecordForm';
import { TABLES } from './schema';

function useRefLabels(table) {
    const [labels, setLabels] = useState({});
    useEffect(() => {
        let cancelled = false;
        const refFields = table.fields.filter((f) => f.type === 'ref' && (table.listColumns || []).includes(f.name));
        Promise.all(refFields.map(async (f) => [f.name, await listOptions(f.table, f.labelColumn, f.valueColumn)]))
            .then((entries) => {
                if (!cancelled)
                    setLabels(Object.fromEntries(entries.map(([name, options]) => [name, Object.fromEntries(options.map((o) => [o.value, o.label]))])));
            })
            .catch(() => { });
        return () => {
            cancelled = true;
        };
    }, [table]);
    return labels;
}

function formatCell(field, value, labels) {
    if (value === null || value === undefined || value === '')
        return <span className="text-muted">—</span>;
    if (field?.type === 'checkbox' || typeof value === 'boolean')
        return value ? 'Yes' : 'No';
    if (field?.type === 'ref')
        return labels[field.name]?.[value] || value;
    if (field?.type === 'select')
        return field.options.find(([v]) => v === value)?.[1] || value;
    const textValue = String(value);
    return textValue.length > 90 ? `${textValue.slice(0, 90)}…` : textValue;
}

function TableList({ table }) {
    const queryClient = useQueryClient();
    const [rows, setRows] = useState(null);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('');
    const [busy, setBusy] = useState(false);
    const labels = useRefLabels(table);

    const load = useCallback(async () => {
        setError('');
        try {
            setRows(await listRows(table));
        }
        catch (err) {
            setError(err.message);
            setRows([]);
        }
    }, [table]);

    useEffect(() => {
        setRows(null);
        setSearch('');
        setFilter('');
        load();
    }, [load]);

    const mutate = async (action) => {
        setBusy(true);
        setError('');
        try {
            await action();
            invalidateContent(queryClient);
            await load();
        }
        catch (err) {
            setError(err.message);
        }
        setBusy(false);
    };

    const columns = useMemo(() => table.listColumns || [table.fields[0].name], [table]);
    const fieldByName = Object.fromEntries(table.fields.map((f) => [f.name, f]));
    const filterField = table.filterBy ? fieldByName[table.filterBy] : null;

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        return (rows || []).filter((row) => {
            if (filter && filterField && row[filterField.name] !== filter)
                return false;
            if (!q)
                return true;
            return columns.some((c) => String(row[c] ?? '').toLowerCase().includes(q));
        });
    }, [rows, search, filter, filterField, columns]);

    const canReorder = table.sortable && !search && !filter;

    const move = (index, delta) => mutate(async () => {
        const next = [...rows];
        const [item] = next.splice(index, 1);
        next.splice(index + delta, 0, item);
        await saveOrder(table, next);
    });

    const remove = (row) => {
        const name = row[columns[0]] || row[table.pk];
        if (window.confirm(`Delete "${name}"? This also deletes its tags/child rows and cannot be undone.`))
            mutate(() => deleteRecord(table, row[table.pk]));
    };

    return (
      <>
        <div className="admin-page-head">
          <div>
            <p className="admin-breadcrumb">{table.group.label}</p>
            <h1 className="admin-title">{table.label}</h1>
            {table.hint ? <p className="text-muted mb-0">{table.hint}</p> : null}
          </div>
          <Link to={`/admin/${table.name}/new`} className="btn btn-primary">
            <i className="fas fa-plus me-1" aria-hidden="true"/> Add new
          </Link>
        </div>

        <div className="admin-toolbar">
          <input type="search" className="form-control" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search rows"/>
          {filterField ? (
            <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label={`Filter by ${filterField.label}`}>
              <option value="">All {filterField.label.toLowerCase()}s</option>
              {Object.entries(labels[filterField.name] || {}).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          ) : null}
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        {rows === null ? (<div className="loading mx-auto my-5"/>) : visible.length === 0 ? (
          <div className="admin-card text-center text-muted">No rows yet.</div>
        ) : (
          <div className="admin-card p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 admin-table">
                <thead>
                  <tr>
                    {canReorder ? <th className="admin-table__order">Order</th> : null}
                    {columns.map((c) => <th key={c}>{fieldByName[c]?.label || c}</th>)}
                    {table.publishable ? <th>Visible</th> : null}
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row, index) => (
                    <tr key={row[table.pk]} className={table.publishable && !row.published ? 'admin-table__row--hidden' : ''}>
                      {canReorder ? (
                        <td className="admin-table__order">
                          <button type="button" className="btn btn-sm btn-light" disabled={busy || index === 0} onClick={() => move(index, -1)} aria-label="Move up">
                            <i className="fas fa-arrow-up" aria-hidden="true"/>
                          </button>
                          <button type="button" className="btn btn-sm btn-light" disabled={busy || index === visible.length - 1} onClick={() => move(index, 1)} aria-label="Move down">
                            <i className="fas fa-arrow-down" aria-hidden="true"/>
                          </button>
                        </td>
                      ) : null}
                      {columns.map((c, ci) => (
                        <td key={c}>
                          {ci === 0 ? (
                            <Link to={`/admin/${table.name}/edit/${encodeURIComponent(row[table.pk])}`}>{formatCell(fieldByName[c], row[c], labels)}</Link>
                          ) : formatCell(fieldByName[c], row[c], labels)}
                        </td>
                      ))}
                      {table.publishable ? (
                        <td>
                          <div className="form-check form-switch m-0">
                            <input className="form-check-input" type="checkbox" role="switch" checked={Boolean(row.published)} disabled={busy} onChange={(e) => mutate(() => setPublished(table, row[table.pk], e.target.checked))} aria-label="Visible on site"/>
                          </div>
                        </td>
                      ) : null}
                      <td className="text-end text-nowrap">
                        <Link to={`/admin/${table.name}/edit/${encodeURIComponent(row[table.pk])}`} className="btn btn-sm btn-outline-primary me-1">Edit</Link>
                        <button type="button" className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => remove(row)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {table.sortable && !canReorder ? <p className="small text-muted mt-2">Clear search and filter to reorder rows.</p> : null}
      </>
    );
}

export function TablePage() {
    const { table: tableName } = useParams();
    const table = TABLES[tableName];
    if (!table)
        return <div className="alert alert-warning">Unknown table “{tableName}”.</div>;
    if (table.singleton)
        return <RecordForm key={table.name}/>;
    return <TableList key={table.name} table={table}/>;
}
