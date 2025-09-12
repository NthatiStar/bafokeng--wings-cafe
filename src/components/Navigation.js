import React from 'react';

const Navigation = ({ activeModule, setActiveModule }) => {
  const modules = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'inventory', name: 'Inventory' },
    { id: 'sales', name: 'Sales' },
    { id: 'customers', name: 'Customers' },
    { id: 'reporting', name: 'Reporting' }
  ];

  const navStyles = {
    mainNav: {
      backgroundColor: '#1a202c',
      padding: '1rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    navList: {
      listStyle: 'none',
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      margin: 0,
      padding: 0,
      flexWrap: 'wrap',
    },
    navItem: {
      padding: '0.75rem 1.5rem',
      color: '#e2e8f0',
      cursor: 'pointer',
      borderRadius: '0.375rem',
      transition: 'background-color 0.3s ease, transform 0.2s ease',
      fontSize: '1rem',
      fontWeight: 500,
      textAlign: 'center',
      userSelect: 'none',
    },
    navItemHover: {
      backgroundColor: '#2d3748',
      transform: 'translateY(-2px)',
    },
    navItemActive: {
      backgroundColor: '#3182ce',
      color: '#ffffff',
      fontWeight: 600,
    }
  };

  return (
    <nav style={navStyles.mainNav}>
      <ul style={navStyles.navList}>
        {modules.map(module => (
          <li
            key={module.id}
            style={{
              ...navStyles.navItem,
              ...(activeModule === module.id ? navStyles.navItemActive : {}),
            }}
            onClick={() => setActiveModule(module.id)}
            onMouseEnter={(e) => {
              if (activeModule !== module.id) {
                e.currentTarget.style.backgroundColor = navStyles.navItemHover.backgroundColor;
                e.currentTarget.style.transform = navStyles.navItemHover.transform;
              }
            }}
            onMouseLeave={(e) => {
              if (activeModule !== module.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'none';
              }
            }}
          >
            {module.name}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;