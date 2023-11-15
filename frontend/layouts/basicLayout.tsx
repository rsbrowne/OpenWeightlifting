import { ReactNode } from "react";

import Header from "layouts/header";

export const BasicLayout = ({ children }: { children: ReactNode }) => (
  <>
    <Header />
    {children}
  </>
)