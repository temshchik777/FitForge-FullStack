import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock компонент для тестирования роутинга
describe('Basic Test Suite', () => {
  test('renders without crashing', () => {
    render(
      <BrowserRouter>
        <div>Test Component</div>
      </BrowserRouter>
    );
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  test('checks if element exists', () => {
    render(<h1>FitForge App</h1>);
    expect(screen.getByText('FitForge App')).toBeInTheDocument();
  });

  test('basic math test', () => {
    expect(1 + 1).toBe(2);
  });
});
