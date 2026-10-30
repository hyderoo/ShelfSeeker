import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ISBNCheckPage from './ISBNcheck';
import { apiJson } from '../../api';

jest.mock('../../api', () => ({ apiJson: jest.fn() }));

beforeEach(() => jest.clearAllMocks());

const search = (value) => {
  fireEvent.change(screen.getByLabelText('Enter ISBN'), { target: { value } });
  fireEvent.click(screen.getByLabelText('Check ISBN'));
};

test('page frames itself as a catalog lookup, not an authenticity check', () => {
  render(<ISBNCheckPage />);
  expect(screen.getByText("Check a Book's ISBN")).toBeInTheDocument();
  expect(screen.queryByText(/authenticity/i)).not.toBeInTheDocument();
});

test('valid ISBN missing from Open Library shows catalog-gap message, no authenticity verdict', async () => {
  apiJson.mockRejectedValue(Object.assign(new Error('Request failed with status 404'), { status: 404 }));
  render(<ISBNCheckPage />);
  search('9791199305304');
  await waitFor(() => expect(screen.getByText(/isn't in the Open Library catalog/i)).toBeInTheDocument());
  expect(screen.queryByText(/may not be an original copy/i)).not.toBeInTheDocument();
});

test('successful lookup is labeled as catalog data', async () => {
  apiJson.mockResolvedValue({ title: 'Harry Potter', isbn_13: '9780747532699' });
  render(<ISBNCheckPage />);
  search('9780747532699');
  await waitFor(() => expect(screen.getByText(/Found in the Open Library catalog/i)).toBeInTheDocument());
});

test('bad check digit shows invalid message and never calls the API', () => {
  render(<ISBNCheckPage />);
  search('9791199305305');
  expect(screen.getByText(/doesn't look valid/i)).toBeInTheDocument();
  expect(apiJson).not.toHaveBeenCalled();
});

test('hyphenated printed ISBN is normalized before lookup', async () => {
  apiJson.mockResolvedValue({ title: 'Harry Potter', isbn_13: '9780747532699' });
  render(<ISBNCheckPage />);
  search('978-0-7475-3269-9');
  await waitFor(() => expect(apiJson).toHaveBeenCalledWith(expect.stringContaining('9780747532699')));
});

test('clearly delimited supplemental is dropped before lookup', async () => {
  apiJson.mockResolvedValue({ title: 'X', isbn_13: '9791199305304' });
  render(<ISBNCheckPage />);
  search('979-11-993053-0-4 (02810)');
  await waitFor(() => expect(apiJson).toHaveBeenCalledWith(expect.stringContaining('9791199305304.json')));
});

test('glued-on supplemental digits are treated as invalid, not silently trimmed', () => {
  render(<ISBNCheckPage />);
  search('979119930530402810');
  expect(screen.getByText(/doesn't look valid/i)).toBeInTheDocument();
  expect(apiJson).not.toHaveBeenCalled();
});

test('network failure shows connection message', async () => {
  apiJson.mockRejectedValue(new Error('Failed to fetch'));
  render(<ISBNCheckPage />);
  search('9780747532699');
  await waitFor(() => expect(screen.getByText(/Couldn't reach the book database/i)).toBeInTheDocument());
});

test('catalog miss offers external lookups for the queried ISBN', async () => {
  apiJson.mockRejectedValue(Object.assign(new Error('Request failed with status 404'), { status: 404 }));
  render(<ISBNCheckPage />);
  search('979-11-993053-0-4 (02810)');
  await waitFor(() => expect(screen.getByText(/another catalog/i)).toBeInTheDocument());
  expect(screen.getByRole('link', { name: 'Google Books' })).toHaveAttribute('href', 'https://books.google.com/books?vid=ISBN9791199305304');
  expect(screen.getByRole('link', { name: 'WorldCat' })).toHaveAttribute('href', 'https://search.worldcat.org/search?q=bn%3A9791199305304');
  expect(screen.getByRole('link', { name: 'Aladin (Korean books)' })).toHaveAttribute('href', 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&SearchWord=9791199305304');
});

test('successful lookup does not show external lookups', async () => {
  apiJson.mockResolvedValue({ title: 'Harry Potter', isbn_13: '9780747532699' });
  render(<ISBNCheckPage />);
  search('9780747532699');
  await waitFor(() => expect(screen.getByText(/Found in the Open Library catalog/i)).toBeInTheDocument());
  expect(screen.queryByRole('link', { name: 'Google Books' })).not.toBeInTheDocument();
});
