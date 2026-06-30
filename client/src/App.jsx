import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Suppliers from './pages/Suppliers';
import Products from './pages/Products';
import NewSupply from './pages/NewSupply';
import Loading from './pages/Loading';
import Shops from './pages/Shops';
import Resources from './pages/Resources';
import Invoices from './pages/Invoices';
import Returns from './pages/Returns';
import Sales from './pages/Sales';
import Settings from './pages/Settings';

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <Dashboard />;
      case 'Suppliers': return <Suppliers />;
      case 'Products': return <Products />;
      case 'NewSupply': return <NewSupply />;
      case 'Loading': return <Loading />;
      case 'Shops': return <Shops />;
      case 'Resources': return <Resources />;
      case 'Invoices': return <Invoices />;
      case 'Returns': return <Returns />;
      case 'Sales': return <Sales />;
      case 'Settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          {activeTab.replace(/([A-Z])/g, ' $1').trim()}
        </h2>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm min-h-[300px] flex items-center justify-center text-gray-500 font-medium">
        {renderContent()}
      </div>
    </Layout>
  );
}

export default App;
