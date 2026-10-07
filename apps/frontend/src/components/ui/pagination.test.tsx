import { createDOM } from '@builder.io/qwik/testing';
import { QwikCityMockProvider } from '@builder.io/qwik-city';
import { describe, expect, it } from 'vitest';
import { Pagination, pageCount, pageHref } from './pagination';

describe('pageHref', () => {
  it('keeps filters and replaces the page', () => {
    expect(pageHref('location=Lyon&page=3', 2)).toBe('?location=Lyon&page=2');
  });

  it('drops the page parameter for the first page', () => {
    expect(pageHref('location=Lyon&page=3', 1)).toBe('?location=Lyon');
    expect(pageHref('', 1)).toBe('?');
  });
});

describe('pageCount', () => {
  it('rounds up partial pages', () => {
    expect(pageCount({ page: 1, pageSize: 6, total: 11 })).toBe(2);
  });

  it('rejects an empty result: still one page', () => {
    expect(pageCount({ page: 1, pageSize: 6, total: 0 })).toBe(1);
  });
});

describe('Pagination', () => {
  it('announces the window and marks the current page', async () => {
    const { screen, render } = await createDOM();
    await render(
      <QwikCityMockProvider>
        <Pagination page={1} pageSize={6} total={11} query="" noun="Salles" />
      </QwikCityMockProvider>,
    );
    expect(screen.textContent).toContain('Salles 1 à 6 sur 11');
    expect(screen.querySelector('[aria-current="page"]')?.textContent).toContain('1');
    expect(screen.textContent).toContain('Suivante');
    expect(screen.textContent).not.toContain('Précédente');
  });

  it('rejects page links when everything fits: no list', async () => {
    const { screen, render } = await createDOM();
    await render(
      <QwikCityMockProvider>
        <Pagination page={1} pageSize={6} total={0} query="" noun="Salles" />
      </QwikCityMockProvider>,
    );
    expect(screen.textContent).toContain('Salles 0 à 0 sur 0');
    expect(screen.querySelector('ul')).toBeFalsy();
  });
});
