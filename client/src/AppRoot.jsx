/** Stable shell height without swapping fullscreen loader → app (reduces CLS). */
const AppRoot = ({ children }) => (
  <div className="min-h-screen w-full min-w-0 max-w-full">{children}</div>
);

export default AppRoot;
