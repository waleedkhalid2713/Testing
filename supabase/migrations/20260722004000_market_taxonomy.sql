-- Adds a consistent forecast market catalog:
-- Market type (CFD/Futures) -> sub-market -> instrument.
alter table public.trading_instruments
  add column if not exists market_type text not null default 'CFD'
    check (market_type in ('CFD', 'Futures')),
  add column if not exists sub_market text not null default 'Forex'
    check (sub_market in ('Indices', 'Commodities', 'Forex', 'Crypto', 'Bonds', 'Yields')),
  add column if not exists name text not null default '';

update public.trading_instruments
set
  market_type = 'CFD',
  sub_market = case
    when market in ('Indices', 'Commodities', 'Forex', 'Crypto', 'Bonds', 'Yields') then market
    else 'Forex'
  end,
  name = case symbol
    when 'EUR/USD' then 'Euro / US Dollar'
    when 'GBP/USD' then 'British Pound / US Dollar'
    when 'USD/JPY' then 'US Dollar / Japanese Yen'
    when 'NAS100' then 'US Tech 100'
    when 'US30' then 'US Wall Street 30'
    when 'XAU/USD' then 'Gold Spot'
    when 'XAG/USD' then 'Silver Spot'
    when 'BTC/USDT' then 'Bitcoin / Tether'
    when 'ETH/USDT' then 'Ethereum / Tether'
    else symbol
  end
where name = '';

insert into public.trading_instruments
  (market, market_type, sub_market, symbol, name, display_order, is_active)
values
  ('Forex', 'CFD', 'Forex', 'EUR/USD', 'Euro / US Dollar', 10, true),
  ('Forex', 'CFD', 'Forex', 'GBP/USD', 'British Pound / US Dollar', 20, true),
  ('Forex', 'CFD', 'Forex', 'USD/JPY', 'US Dollar / Japanese Yen', 30, true),
  ('Forex', 'CFD', 'Forex', 'AUD/USD', 'Australian Dollar / US Dollar', 40, true),
  ('Forex', 'CFD', 'Forex', 'USD/CAD', 'US Dollar / Canadian Dollar', 50, true),
  ('Indices', 'CFD', 'Indices', 'US30', 'US Wall Street 30', 60, true),
  ('Indices', 'CFD', 'Indices', 'NAS100', 'US Tech 100', 70, true),
  ('Indices', 'CFD', 'Indices', 'US500', 'US 500', 80, true),
  ('Indices', 'CFD', 'Indices', 'GER40', 'Germany 40', 90, true),
  ('Indices', 'CFD', 'Indices', 'UK100', 'UK 100', 100, true),
  ('Commodities', 'CFD', 'Commodities', 'XAU/USD', 'Gold Spot', 110, true),
  ('Commodities', 'CFD', 'Commodities', 'XAG/USD', 'Silver Spot', 120, true),
  ('Commodities', 'CFD', 'Commodities', 'WTI', 'West Texas Intermediate Oil', 130, true),
  ('Commodities', 'CFD', 'Commodities', 'BRENT', 'Brent Crude Oil', 140, true),
  ('Crypto', 'CFD', 'Crypto', 'BTC/USDT', 'Bitcoin / Tether', 150, true),
  ('Crypto', 'CFD', 'Crypto', 'ETH/USDT', 'Ethereum / Tether', 160, true),
  ('Crypto', 'CFD', 'Crypto', 'SOL/USDT', 'Solana / Tether', 170, true),
  ('Crypto', 'CFD', 'Crypto', 'XRP/USDT', 'XRP / Tether', 180, true),
  ('Bonds', 'CFD', 'Bonds', 'US10Y-CFD', 'US 10-Year Treasury CFD', 190, true),
  ('Bonds', 'CFD', 'Bonds', 'DE10Y-CFD', 'Germany 10-Year Bund CFD', 200, true),
  ('Yields', 'CFD', 'Yields', 'US02Y-YIELD', 'US 2-Year Treasury Yield', 210, true),
  ('Yields', 'CFD', 'Yields', 'US10Y-YIELD', 'US 10-Year Treasury Yield', 220, true),
  ('Forex', 'Futures', 'Forex', '6E1!', 'Euro FX Futures', 230, true),
  ('Forex', 'Futures', 'Forex', '6B1!', 'British Pound Futures', 240, true),
  ('Forex', 'Futures', 'Forex', '6J1!', 'Japanese Yen Futures', 250, true),
  ('Indices', 'Futures', 'Indices', 'YM1!', 'Dow Jones Futures', 260, true),
  ('Indices', 'Futures', 'Indices', 'NQ1!', 'Nasdaq 100 Futures', 270, true),
  ('Indices', 'Futures', 'Indices', 'ES1!', 'S&P 500 Futures', 280, true),
  ('Indices', 'Futures', 'Indices', 'FDAX1!', 'DAX Futures', 290, true),
  ('Commodities', 'Futures', 'Commodities', 'GC1!', 'Gold Futures', 300, true),
  ('Commodities', 'Futures', 'Commodities', 'SI1!', 'Silver Futures', 310, true),
  ('Commodities', 'Futures', 'Commodities', 'CL1!', 'WTI Crude Oil Futures', 320, true),
  ('Commodities', 'Futures', 'Commodities', 'BZ1!', 'Brent Crude Oil Futures', 330, true),
  ('Crypto', 'Futures', 'Crypto', 'BTCUSD-PERP', 'Bitcoin Perpetual Futures', 340, true),
  ('Crypto', 'Futures', 'Crypto', 'ETHUSD-PERP', 'Ethereum Perpetual Futures', 350, true),
  ('Bonds', 'Futures', 'Bonds', 'ZN1!', 'US 10-Year Treasury Note Futures', 360, true),
  ('Bonds', 'Futures', 'Bonds', 'ZB1!', 'US Treasury Bond Futures', 370, true),
  ('Yields', 'Futures', 'Yields', 'ZN1!-YIELD', 'US 10-Year Treasury Futures Yield', 380, true),
  ('Yields', 'Futures', 'Yields', 'ZB1!-YIELD', 'US Treasury Bond Futures Yield', 390, true)
on conflict (symbol) do update set
  market = excluded.market,
  market_type = excluded.market_type,
  sub_market = excluded.sub_market,
  name = excluded.name,
  display_order = excluded.display_order,
  is_active = excluded.is_active;
