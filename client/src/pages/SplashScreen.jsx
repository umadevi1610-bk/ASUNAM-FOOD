
import logo from "../assets/asunam-logo.png";
import "./SplashScreen.css";

function SplashScreen() {
  return (
    <main className="splash-screen">
      <div className="splash-glow splash-glow-one" />
      <div className="splash-glow splash-glow-two" />

      <div className="splash-content">
        <div className="splash-logo-wrap">
          <div className="splash-logo-ring" />

          <img
            src={logo}
            alt="ASUNAM FOOD Logo"
            className="splash-logo"
          />
        </div>

        <div className="splash-brand">
          <h1>ASUNAM</h1>
          <span>FOOD</span>
        </div>

        <div className="splash-divider">
          <span />
          <span className="splash-diamond">◆</span>
          <span />
        </div>

        <p className="splash-tagline">
          Good Food. Good Mood.
        </p>

        <p className="splash-caption">
          A TASTE OF HAPPINESS
        </p>

        <div className="splash-loader">
          <span />
        </div>
      </div>
    </main>
  );
}

export default SplashScreen;
