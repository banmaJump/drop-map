import React from 'react';
import { Helmet } from 'react-helmet-async';

interface CommonPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

const CommonPageLayout: React.FC<CommonPageLayoutProps> = ({ title, children }) => {
  return (
    <div className="uq57a_layout">
      <Helmet>
        <title>{title} - BANMA</title>
      </Helmet>
      <main className="ra92z_main">
        <div className="ow83d_container">
          <h1 className="jf14x_heading">{title}</h1>
          <div className="bv69y_content">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default CommonPageLayout;
