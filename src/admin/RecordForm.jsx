import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateContent } from '../content/useContent';
import { getRecord, saveRecord } from './adminApi';
import { FieldInput } from './fields';
import { TABLES } from './schema';

function fieldSchema(field, { optional = false } = {}) {
    if (field.type === 'checkbox')
        return z.boolean();
    let schema = z.string();
    if (field.required && !optional)
        schema = schema.trim().min(1, `${field.label} is required`);
    if (field.type === 'number')
        schema = schema.refine((v) => v.trim() === '' || Number.isFinite(Number(v)), 'Enter a number');
    return schema;
}

function buildSchema(table, isNew) {
    const shape = {};
    for (const field of table.fields) {
        const isTextPk = field.pk && field.type !== 'ref';
        shape[field.name] = fieldSchema(field, { optional: isTextPk || (field.pk && !isNew) });
    }
    if (table.publishable)
        shape.published = z.boolean();
    for (const child of table.children || []) {
        const childShape = Object.fromEntries(child.fields.map((f) => [f.name, fieldSchema(f)]));
        shape[child.table] = z.array(z.object(childShape));
    }
    return z.object(shape);
}

function toFormValue(field, value) {
    if (field.type === 'checkbox')
        return Boolean(value);
    if (value === null || value === undefined)
        return field.defaultValue ?? '';
    return String(value);
}

function emptyRow(child) {
    return Object.fromEntries(child.fields.map((f) => [f.name, f.type === 'checkbox' ? false : (f.defaultValue ?? '')]));
}

function toFormValues(table, record) {
    const values = {};
    for (const field of table.fields)
        values[field.name] = toFormValue(field, record?.[field.name]);
    if (table.publishable)
        values.published = record ? Boolean(record.published) : true;
    for (const child of table.children || []) {
        values[child.table] = (record?.[child.table] || []).map((row) => Object.fromEntries(
            child.fields.map((f) => [f.name, toFormValue(f, row[f.name])]),
        ));
    }
    return values;
}

function ChildRows({ control, child, folder }) {
    const { fields, append, remove, move } = useFieldArray({ control, name: child.table });
    const ordered = child.ordered !== false;
    return (
      <fieldset className="admin-children">
        <legend className="admin-children__legend">{child.label}</legend>
        {fields.length === 0 ? <p className="text-muted small mb-2">None yet.</p> : null}
        {fields.map((row, index) => (
          <div key={row.id} className="admin-child-row">
            <div className="admin-child-row__fields">
              {child.fields.map((f) => (
                <FieldInput key={f.name} control={control} name={`${child.table}.${index}.${f.name}`} field={f} folder={folder} compact/>
              ))}
            </div>
            <div className="admin-child-row__actions">
              {ordered ? (<>
                  <button type="button" className="btn btn-sm btn-light" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label="Move up">
                    <i className="fas fa-arrow-up" aria-hidden="true"/>
                  </button>
                  <button type="button" className="btn btn-sm btn-light" disabled={index === fields.length - 1} onClick={() => move(index, index + 1)} aria-label="Move down">
                    <i className="fas fa-arrow-down" aria-hidden="true"/>
                  </button>
                </>) : null}
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => remove(index)} aria-label="Remove">
                <i className="fas fa-times" aria-hidden="true"/>
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => append(emptyRow(child))}>
          <i className="fas fa-plus me-1" aria-hidden="true"/> Add {child.fields[0].label.toLowerCase()}
        </button>
      </fieldset>
    );
}

function Form({ table, record, recordId }) {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const isNew = recordId == null;
    const schema = useMemo(() => buildSchema(table, isNew), [table, isNew]);
    const { control, handleSubmit, reset, formState } = useForm({
        resolver: zodResolver(schema),
        defaultValues: toFormValues(table, record),
    });
    const [status, setStatus] = useState({ error: '', saved: Boolean(location.state?.saved) });

    const onSubmit = async (values) => {
        setStatus({ error: '', saved: false });
        try {
            const savedId = await saveRecord(table, values, table.singleton ? undefined : recordId);
            invalidateContent(queryClient);
            if (table.singleton) {
                reset(values);
                setStatus({ error: '', saved: true });
            }
            else if (isNew) {
                navigate(`/admin/${table.name}/edit/${encodeURIComponent(savedId)}`, { replace: true, state: { saved: true } });
            }
            else {
                reset(values);
                setStatus({ error: '', saved: true });
            }
        }
        catch (err) {
            setStatus({ error: err.message, saved: false });
        }
    };

    const title = table.singleton ? table.label : isNew ? `New ${table.label.toLowerCase().replace(/s$/, '')}` : `Edit ${table.label.toLowerCase().replace(/s$/, '')}`;

    return (
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="admin-page-head">
          <div>
            <p className="admin-breadcrumb">
              {table.group.label}
              {table.singleton ? null : <> / <Link to={`/admin/${table.name}`}>{table.label}</Link></>}
            </p>
            <h1 className="admin-title">{title}</h1>
            {table.hint ? <p className="text-muted mb-0">{table.hint}</p> : null}
          </div>
        </div>

        <div className="admin-card">
          {table.fields.map((field) => {
              const isPk = field.pk;
              if (isPk && isNew && field.type !== 'ref') {
                  return (
                    <FieldInput
                      key={field.name}
                      control={control}
                      name={field.name}
                      field={{ ...field, label: `${field.label} (leave empty to generate from ${table.pkFrom || 'title'})` }}
                      folder={table.name}
                    />
                  );
              }
              return <FieldInput key={field.name} control={control} name={field.name} field={field} folder={table.name} disabled={isPk && !isNew}/>;
          })}

          {(table.children || []).map((child) => (
            <ChildRows key={child.table} control={control} child={child} folder={table.name}/>
          ))}

          {table.publishable ? (
            <FieldInput control={control} name="published" field={{ name: 'published', label: 'Visible on the public site', type: 'checkbox' }}/>
          ) : null}
        </div>

        {status.error ? <div className="alert alert-danger mt-3">{status.error}</div> : null}
        {status.saved && !formState.isDirty ? <div className="alert alert-success mt-3 py-2">Saved.</div> : null}

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? 'Saving…' : 'Save'}
          </button>
          {table.singleton ? null : <Link to={`/admin/${table.name}`} className="btn btn-outline-secondary">Back to list</Link>}
        </div>
      </form>
    );
}

export function RecordForm() {
    const { table: tableName, id: rawId } = useParams();
    const table = TABLES[tableName];
    const recordId = table?.singleton ? 'default' : rawId != null ? decodeURIComponent(rawId) : null;
    const [state, setState] = useState({ key: null, record: null, error: '' });
    const key = `${tableName}:${recordId}`;

    useEffect(() => {
        if (!table || recordId == null)
            return undefined;
        let cancelled = false;
        getRecord(table, recordId)
            .then((record) => !cancelled && setState({ key, record, error: '' }))
            .catch((err) => !cancelled && setState({ key, record: null, error: err.message }));
        return () => {
            cancelled = true;
        };
    }, [table, recordId, key]);

    if (!table)
        return <div className="alert alert-warning">Unknown table “{tableName}”.</div>;
    if (recordId == null)
        return <Form key={`${tableName}:new`} table={table} record={null} recordId={null}/>;
    if (state.key !== key)
        return <div className="loading mx-auto my-5"/>;
    if (state.error)
        return <div className="alert alert-danger">{state.error}</div>;
    if (!state.record && !table.singleton)
        return <div className="alert alert-warning">Record not found. <Link to={`/admin/${table.name}`}>Back to list</Link></div>;
    return <Form key={key} table={table} record={state.record} recordId={table.singleton ? (state.record ? 'default' : null) : recordId}/>;
}
