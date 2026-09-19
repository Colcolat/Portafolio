export default function ByteGameScreen({ game, t, onPrimary, rewardFound, onOpenReward }) {
  return <div className="game-area">
    <svg className="snake-board" viewBox="0 0 120 120" role="img" aria-label={t('Snake board, score {score}', { score: game.score })}>
      <defs><pattern id="game-grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0v10" fill="none" stroke="currentColor" strokeOpacity=".08" strokeWidth=".5" /></pattern></defs>
      <rect width="120" height="120" fill="url(#game-grid)" />
      {game.snake.map((cell, i) => <rect key={`${cell.x}-${cell.y}`} x={cell.x * 10 + 1} y={cell.y * 10 + 1} width="8" height="8" fill="currentColor" opacity={i === 0 ? 1 : .7} />)}
      <rect x={game.food.x * 10 + 2} y={game.food.y * 10 + 2} width="6" height="6" fill="currentColor" />
    </svg>
    {game.status !== 'playing' && <div className="game-overlay">
      <strong>{t({ ready: 'BYTE SNAKE', paused: 'TAKE A BREATHER', over: 'ONE MORE TRY?', won: 'YOU DID IT!' }[game.status])}</strong>
      <p>{game.status === 'ready' ? t('Collect bytes. Keep growing.') : t('SCORE {score} · BEST {best}', { score: String(game.score).padStart(2, '0'), best: String(game.highScore).padStart(2, '0') })}</p>
      <div className="game-overlay-actions">
        <button type="button" onClick={onPrimary}>{t(game.status === 'paused' ? 'A: RESUME' : 'A: LET’S PLAY')}</button>
        {rewardFound && <button type="button" className="game-reward-link" onClick={onOpenReward}><span aria-hidden="true">★</span> {t('VIEW TROPHY')}</button>}
      </div>
    </div>}
    <span className="game-best">{t('BEST {best} · A: PAUSE', { best: String(game.highScore).padStart(2, '0') })}{rewardFound && <span className="game-trophy-mark" aria-label={t('Byte keeper unlocked. Pause to view your trophy.')}> ★</span>}</span>
  </div>;
}
