import { Link } from 'react-router-dom';
import './SiteFooter.css';

export function SiteFooter() {
    const year = new Date().getFullYear();
    return (<footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-4">
            <h5>Smart Sensing for Climate &amp; Development</h5>
            <p>Sustainable solutions through innovative technologies and data-driven research.</p>
          </div>
          <div className="col-lg-4">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/Home">Home</Link></li>
              <li><Link to="/Who-We-Are">Who We Are</Link></li>
              <li><Link to="/Lab">SCD Lab</Link></li>
              <li><Link to="/Society">SCD Society</Link></li>
              <li><Link to="/Academy">SCD Research Academy</Link></li>
              <li><Link to="/People">People</Link></li>
            </ul>
          </div>
          <div className="col-lg-4">
            <h5>Contact Us</h5>
            <div className="social-links">
              <a href="tel:+923004641319" aria-label="Call us">
                <i className="fas fa-phone me-3"/>
              </a>
              <a href="mailto:gss.gis.eo@gmail.com" aria-label="Email us">
                <i className="fas fa-envelope me-3"/>
              </a>
              <a href="https://www.facebook.com/SCD.GS/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i className="fab fa-facebook me-3"/>
              </a>
              <a href="https://www.linkedin.com/in/smart-sensing-for-climate-and-development-265b76255/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <i className="fab fa-linkedin me-3"/>
              </a>
              <a href="https://wa.me/923004641319" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <i className="fab fa-whatsapp me-3"/>
              </a>
              <a href="https://maps.app.goo.gl/JCDKqvruDWWBW9JC9" target="_blank" rel="noopener noreferrer" aria-label="Location on Google Maps">
                <i className="fas fa-map-marker-alt me-2"/>
              </a>
            </div>
          </div>
        </div>
        <hr />
        <div className="row">
          <div className="col-12 text-center">
            <p>
              &copy; {year} Smart Sensing for Climate &amp; Development | Abrar M Bhatti &amp; Shah M Hanan. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>);
}
