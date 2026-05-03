/** Stable shell height without swapping fullscreen loader → app (reduces CLS). */
const AppRoot = ({ children }) => (
  <div style={{ minHeight: "100vh" }}>{children}</div>
);

export default AppRoot;
