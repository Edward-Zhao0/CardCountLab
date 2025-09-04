import "../styles/Home.css";
import ShaderCanvas from "../components/ShaderCanvas.jsx";

const Home = () => {
  return (
    <>
      <div className="fullscreen">
        {/* Background Shader */}
        {/* <ShaderCanvas /> */}

        <section className="hero">
          <div className="hero-content">
            <h1>Train Smarter, Play Better</h1>
            <p>The ultimate way to study, practice, and improve your game.</p>
            <button className="cta-button">Get Started for free</button>
          </div>
          <div className="hero-image">
            <img
              src="https://via.placeholder.com/500x300"
              alt="App preview"
            />
          </div>
        </section>
      </div>

      <section className="features">
        <div className="feature">
          <img src="https://via.placeholder.com/150" alt="Feature 1" />
          <h3>Practice Mode</h3>
          <p>Sharpen your skills with real scenarios and instant feedback.</p>
        </div>
        <div className="feature">
          <img src="https://via.placeholder.com/150" alt="Feature 2" />
          <h3>Track Progress</h3>
          <p>Measure improvement over time and spot your weaknesses.</p>
        </div>
        <div className="feature">
          <img src="https://via.placeholder.com/150" alt="Feature 3" />
          <h3>Learn Anywhere</h3>
          <p>Access training tools on any device, anytime.</p>
        </div>
      </section>
    </>
  );
};

export default Home;