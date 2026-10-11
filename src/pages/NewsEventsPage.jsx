import { SectionTitle } from '../components/SectionTitle';
import { NewsEventsContent } from '../components/NewsEventsContent';
export function NewsEventsPage() {
    return (<main>
      <section id="news-events" className="section">
        <div className="container">
          <SectionTitle title="News & Events" subtitle="Past events with details, plus updated upcoming bulletins."/>
          <NewsEventsContent />
        </div>
      </section>
    </main>);
}
