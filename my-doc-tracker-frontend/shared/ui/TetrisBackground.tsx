import styles from './TetrisBackground.module.scss';

export const Background = () => (
  <div className={styles.ClientLayout__universe}>
    <div className={styles.ClientLayout__layer2}></div>
    <div className={styles.ClientLayout__layer1}></div>
    <div className={styles.ClientLayout__layer3}></div>
    
    <div className={styles.ClientLayout__bubble1}></div>
    <div className={styles.ClientLayout__bubble2}></div>
    <div className={styles.ClientLayout__bubble3}></div>
    <div className={styles.ClientLayout__bubble4}></div>
    
    <div className={styles.ClientLayout__bubble5}></div>
    <div className={styles.ClientLayout__bubble6}></div>
    <div className={styles.ClientLayout__bubble7}></div>
    
    {/* <div className={styles.ClientLayout__prism1}></div>
    <div className={styles.ClientLayout__prism2}></div>
    <div className={styles.ClientLayout__prism3}></div>
    
    <div className={styles.ClientLayout__prism4}></div>
    <div className={styles.ClientLayout__prism5}></div> */}
    
    <div className={styles.ClientLayout__particle1}></div>
    <div className={styles.ClientLayout__particle2}></div>
    <div className={styles.ClientLayout__particle3}></div>
    <div className={styles.ClientLayout__particle4}></div>
    <div className={styles.ClientLayout__particle5}></div>
    <div className={styles.ClientLayout__particle6}></div>
    <div className={styles.ClientLayout__particle7}></div>
    <div className={styles.ClientLayout__particle8}></div>
    <div className={styles.ClientLayout__particle9}></div>
    <div className={styles.ClientLayout__particle10}></div>
    
    <div className={styles.ClientLayout__ray1}></div>
    <div className={styles.ClientLayout__ray2}></div>
  </div>
);