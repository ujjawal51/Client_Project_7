import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('Performance Optimization for News Blog - Acceptance Criteria & NFRs', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Happy Path & Agile User Stories', () => {
    it('renders the corporate ticket metadata and primary interface clearly', () => {
      render(<App />);
      expect(screen.getAllByText(/ENG-84718/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/Performance Optimization for News Blog/i)).toBeInTheDocument();
      expect(screen.getByText(/Floor Staff Portal/i)).toBeInTheDocument();
    });

    it('allows floor staff to add a new performance optimization entry', async () => {
      const user = userEvent.setup();
      render(<App />);

      const titleInput = screen.getByLabelText(/Article or Page Title/i);
      const urlInput = screen.getByLabelText(/Article URL/i);
      const currentValueInput = screen.getByLabelText(/Current Metric Value/i);
      const targetValueInput = screen.getByLabelText(/Target Metric Value/i);
      const submitButton = screen.getByRole('button', { name: /Add Optimization Task/i });

      await user.type(titleInput, 'Global Climate Summit Headline');
      await user.type(urlInput, 'https://newsblog.example.com/climate-summit');
      await user.clear(currentValueInput);
      await user.type(currentValueInput, '4.2');
      await user.clear(targetValueInput);
      await user.type(targetValueInput, '1.5');

      await user.click(submitButton);

      const createdItems = await screen.findAllByText('Global Climate Summit Headline');
      expect(createdItems.length).toBeGreaterThan(0);
    });
  });

  describe('2. Unhappy Path (Edge Cases)', () => {
    it('displays user-friendly "No data found" message when search or filter returns no results', async () => {
      const user = userEvent.setup();
      render(<App />);

      const searchInput = screen.getByLabelText(/Search performance records/i);
      await user.type(searchInput, 'nonexistent-article-xyz-query');

      expect(screen.getByText(/No data found/i)).toBeInTheDocument();
      expect(screen.getByText(/No performance records match your current search/i)).toBeInTheDocument();
    });

    it('shows visual loading indicator during asynchronous operations simulating slow 3G network', async () => {
      render(<App />);

      const syncButtons = screen.getAllByRole('button', { name: /Run Performance Audit Sync/i });
      fireEvent.click(syncButtons[0]);

      // Verify loading indicator is present
      const loadingIndicator = screen.getByTestId('loading-indicator');
      expect(loadingIndicator).toBeInTheDocument();
      expect(screen.getByText(/Simulating network sync/i)).toBeInTheDocument();

      // After async finish, loading should be cleared
      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      }, { timeout: 3500 });
    });

    it('prevents submission on invalid/empty inputs and highlights offending fields in red', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Clear required fields and attempt to submit
      const titleInput = screen.getByLabelText(/Article or Page Title/i);
      await user.clear(titleInput);

      const submitButton = screen.getByRole('button', { name: /Add Optimization Task/i });
      await user.click(submitButton);

      // Verify error states
      expect(titleInput).toHaveAttribute('aria-invalid', 'true');
      expect(titleInput.classList.contains('input-error') || titleInput.className.includes('error')).toBe(true);
      expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
    });
  });

  describe('3. Non-Functional Requirements (NFRs)', () => {
    it('logs telemetry ping "[Analytics] User interacted with Performance Optimization" upon primary actions', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const user = userEvent.setup();
      render(<App />);

      const titleInput = screen.getByLabelText(/Article or Page Title/i);
      const urlInput = screen.getByLabelText(/Article URL/i);
      const submitButton = screen.getByRole('button', { name: /Add Optimization Task/i });

      await user.type(titleInput, 'Tech Breaking Story');
      await user.type(urlInput, 'https://newsblog.example.com/tech-story');
      await user.click(submitButton);

      const hasAnalyticsCall = consoleSpy.mock.calls.some((callArgs) =>
        callArgs.some(
          (arg) =>
            typeof arg === 'string' &&
            arg.includes('[Analytics] User interacted with Performance Optimization')
        )
      );

      expect(hasAnalyticsCall).toBe(true);
    });

    it('sanitizes malicious XSS script injection in user input before storing to state', async () => {
      const user = userEvent.setup();
      render(<App />);

      const titleInput = screen.getByLabelText(/Article or Page Title/i);
      const urlInput = screen.getByLabelText(/Article URL/i);
      const submitButton = screen.getByRole('button', { name: /Add Optimization Task/i });

      const xssInput = 'Dangerous <script>window.pwned=true</script> Blog News';
      await user.type(titleInput, xssInput);
      await user.type(urlInput, 'https://newsblog.example.com/clean-link');
      await user.click(submitButton);

      expect(screen.queryByText(/<script>/i)).not.toBeInTheDocument();
      const sanitizedMatches = screen.getAllByText(/Dangerous Blog News/i);
      expect(sanitizedMatches.length).toBeGreaterThan(0);
    });

    it('has accessible interactive elements with appropriate ARIA labels and keyboard navigability', () => {
      render(<App />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach((btn) => {
        expect(btn).toHaveAttribute('aria-label');
      });

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        expect(input).toHaveAttribute('aria-label');
      });
    });
  });
});
