import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Gallery 1 when the component mounts
    router.push('/gallery/');
  }, [router]); // Include 'router' in the dependency array

  return (
    <div>
    </div>
  );
};

export default Home;