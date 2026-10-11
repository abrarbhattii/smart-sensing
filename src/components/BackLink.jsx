import { Link } from 'react-router-dom';
import './BackLink.css';
export function BackLink({ to, label, title }) {
    return (<Link to={to} className="back-to-research" title={title}>
      <i className="fas fa-arrow-left"/> {label}
    </Link>);
}
