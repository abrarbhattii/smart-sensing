import { Link } from 'react-router-dom';
import { SectionTitle } from '../components/SectionTitle';

export function NotFoundPage() {
    return (
      <section className="section">
        <div className="container text-center">
          <SectionTitle title="Page not found" subtitle="The page you are looking for does not exist or has been moved."/>
          <Link to="/Home" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </section>
    );
}
