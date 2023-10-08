import { useRouter } from 'next/router';
import styles from './[before-and-after].module.css'; // Import your CSS file

function BeforeAndAfter({ beforeImages, afterImages }) {
  const router = useRouter();
  const { index } = router.query;

  // Ensure index is a valid number and within the array bounds
  const imageIndex = parseInt(index);
  if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= beforeImages.length) {
    return <div>Invalid index</div>;
  }

  const beforeImage = beforeImages[imageIndex];
  const afterImage = afterImages[imageIndex];

  return (
    <div>
      {/* Your "before and after" content */}
      <h1>Before and After Image #{imageIndex}</h1>
      {/* Render a pair of images */}
      <div className={styles.imagePair}>
        <div className={styles.column}>
          <img src={beforeImage.url} alt={beforeImage.name} />
        </div>
        <div className={styles.column}>
          <img src={afterImage.url} alt={afterImage.name} />
        </div>
      </div>
      {/* Add your images and other content here */}
    </div>
  );
}

export default BeforeAndAfter;