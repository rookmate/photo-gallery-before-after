import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Gallery 1 when the component mounts
    router.push('/gallery/1');
  }, []);

  return (
    <div>
    </div>
  );
};

export default Home;