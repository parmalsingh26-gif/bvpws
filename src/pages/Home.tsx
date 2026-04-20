import HeroSlider from '../components/HeroSlider';
import NewsTicker from '../components/NewsTicker';
import Leadership from '../components/Leadership';
import NotificationBoard from '../components/NotificationBoard';
import WorkshopStats from '../components/WorkshopStats';
import MediaGallery from '../components/MediaGallery';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSlider />
      <NewsTicker />
      <main className="flex-grow">
        <WorkshopStats />
        <Leadership />
        <MediaGallery limit={6} />
        <NotificationBoard limit={5} />
      </main>
    </div>
  );
}
