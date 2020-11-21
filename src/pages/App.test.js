import { render, screen } from '@testing-library/react';
import FaceApp from './FaceApp';

test('renders learn react link', () => {
  render(<FaceApp />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
