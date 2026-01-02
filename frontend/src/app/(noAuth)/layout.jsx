import Header from "./components/layout/Header";

const ClientLayout = ({ children }) => {
  return (
    <>
      <Header />
      {children}
    </>
  );
};

export default ClientLayout;
