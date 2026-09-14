import { useEffect, useReducer, useRef, useState } from 'react';
import PixelArt from './PixelArt';
import { createMemoryDeck, createMemoryGame, memoryGameReducer, memoryNeighbor, memoryRevealDelay } from '../hooks/memoryGame';
import './SecretCartridge.css';

const symbolNames = { vault: 'Vault', bolt: 'Lightning', sprout: 'Sprout', smile: 'Smile' };

export function CartridgeArt() {
  return <svg className="cartridge-art secret-cartridge-art" viewBox="0 0 96 80" aria-hidden="true" focusable="false" shapeRendering="crispEdges">
    <path fill="currentColor" d="M22 3h52v5h8v61h-8v7H22v-7h-8V8h8z" />
    <path fill="var(--lcd, #a9b979)" d="M22 10h52v3h3v52h-7v4H26v-4h-7V13h3z" />
    <g fill="currentColor">
      <path d="M25 15h46v3H25zm0 6h46v3H25zm3 41h40v3H28z" />
      <path d="M27 30h42v27H27z" />
      <path d="M29 69h4v4h-4zm8 0h4v4h-4zm8 0h4v4h-4zm8 0h4v4h-4zm8 0h4v4h-4z" />
    </g>
    <g fill="var(--lcd, #a9b979)">
      <path d="M33 35h12v16H33zm18 0h12v16H51z" />
    </g>
    <g fill="currentColor"><path d="M37 39h4v8h-4zm18 0h4v8h-4z" /></g>
  </svg>;
}

export default function SecretCartridge({ t }) {
  const [game, dispatch] = useReducer(memoryGameReducer, undefined, () => createMemoryGame());
  const [focusedCard, setFocusedCard] = useState(0);
  const cardRefs = useRef([]);
  const pairs = game.matched.length / 2;

  useEffect(() => {
    if (game.phase !== 'comparing') return undefined;
    const timeout = window.setTimeout(() => dispatch({ type: 'resolve' }), memoryRevealDelay);
    return () => window.clearTimeout(timeout);
  }, [game.phase, game.flipped]);

  const status = game.phase === 'won'
    ? t('All four pairs found. Nice memory!')
    : game.phase === 'comparing'
      ? t('Two cards revealed. Checking the pair…')
      : game.flipped.length === 1
        ? t('One card revealed. Pick its partner.')
        : t('Choose two cards to find a pair.');

  const navigate = (event, index) => {
    if (event.repeat && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = memoryNeighbor(index, event.key);
    if (next === index) return;
    setFocusedCard(next);
    cardRefs.current[next]?.focus();
  };

  const restart = () => {
    dispatch({ type: 'reset', deck: createMemoryDeck() });
    setFocusedCard(0);
  };

  return <div className="secret-cartridge">
    <p className="secret-cartridge__intro">{t('One more game was hiding in plain sight.')}</p>
    <p className="secret-cartridge__instructions">{t('Eight cards. Four pairs. No timer, just a little curiosity.')}</p>
    <section className="secret-cartridge__shell" aria-label={t('Pocket pairs memory game')}>
      <div className="secret-cartridge__ridges" aria-hidden="true"><i /><i /><i /></div>
      <div className="secret-cartridge__label">
        <div className="secret-cartridge__edition"><span>{t('BONUS CARTRIDGE')}</span><span aria-hidden="true">03</span></div>
        <div className="secret-cartridge__heading"><h3>{t('Pocket pairs')}</h3><CartridgeArt /></div>
        <div className="secret-cartridge__score" aria-label={t('Game progress')}>
          <span>{t('Pairs')} <b>{pairs}/4</b></span><span>{t('Attempts')} <b>{String(game.moves).padStart(2, '0')}</b></span>
        </div>
        <div className="secret-cartridge__board" role="group" aria-label={t('Memory cards')} aria-describedby="memory-keyboard-help">
          {game.deck.map((symbol, index) => {
            const matched = game.matched.includes(index);
            const revealed = matched || game.flipped.includes(index);
            const label = revealed
              ? t(matched ? 'Card {number}: {symbol}, matched' : 'Card {number}: {symbol}', { number: index + 1, symbol: t(symbolNames[symbol]) })
              : t('Card {number}: face down', { number: index + 1 });
            return <button key={index} ref={node => { cardRefs.current[index] = node; }} type="button"
              className={`secret-cartridge__card${revealed ? ' is-revealed' : ''}${matched ? ' is-matched' : ''}`}
              tabIndex={focusedCard === index ? 0 : -1} aria-label={label}
              aria-disabled={matched || game.phase !== 'playing' || revealed}
              onFocus={() => setFocusedCard(index)} onKeyDown={event => navigate(event, index)}
              onClick={() => dispatch({ type: 'flip', index })}>
              {revealed ? <PixelArt name={symbol} /> : <span aria-hidden="true">?</span>}
              <small aria-hidden="true">{matched ? '✓' : String(index + 1).padStart(2, '0')}</small>
            </button>;
          })}
        </div>
        <p className="secret-cartridge__status" role="status" aria-live="polite" aria-atomic="true">{status}</p>
        <div className="secret-cartridge__bottom"><span aria-hidden="true">{game.phase === 'won' ? '✦ ✦ ✦ ✦' : '● ○ ○ ○'}</span><button type="button" onClick={restart}>{t(game.phase === 'won' ? 'Play again' : 'Shuffle & restart')}<span aria-hidden="true">↻</span></button></div>
      </div>
      <div className="secret-cartridge__contacts" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</div>
    </section>
    <p className="secret-cartridge__help" id="memory-keyboard-help">{t('Tap to flip. With a keyboard, use the arrows to move and Enter or Space to flip.')}</p>
  </div>;
}
