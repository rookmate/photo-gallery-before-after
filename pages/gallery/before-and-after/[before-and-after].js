import { useRouter } from 'next/router';

function BeforeAndAfter() {
  const router = useRouter();
  const { index } = router.query;

  // Render your "before and after" content here based on the index

  return (
    <div>
      {/* Your "before and after" content */}
      <h1>Before and After Image #{index}</h1>
      {/* Add your images and other content here */}
    </div>
  );
}

export default BeforeAndAfter;