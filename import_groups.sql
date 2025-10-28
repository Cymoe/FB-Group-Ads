-- Import Facebook Groups Data
-- Run this in your Supabase SQL Editor to import all 52 groups

INSERT INTO groups (name, tier, category, audience_size, status) VALUES
-- Tier 1 (High Priority) - Post 3-4x/week
('Midland TX Houses for Sell or Rent', 'high', 'Home & Real Estate', 19500, 'active'),
('Buying or Selling a Home in Odessa/Midland TX', 'high', 'Home & Real Estate', 3800, 'active'),
('Gardendale Community', 'high', 'Community', 6000, 'active'),
('Midland-Odessa Homes for Sale/Rent', 'high', 'Home & Real Estate', 32900, 'active'),
('West Texas Buy, Sell, Trade', 'high', 'Buy & Sell', 48900, 'active'),
('Odessa/midland buy sell trade', 'high', 'Buy & Sell', 66900, 'active'),
('What''s Good Midland', 'high', 'Community', 8700, 'active'),
('midland odessa buy and sell everything', 'high', 'Buy & Sell', 35400, 'active'),
('Midland/Odessa TX, BUY-SELL-TRADE', 'high', 'Buy & Sell', 59400, 'active'),
('Midland/Odessa for SALE!', 'high', 'Buy & Sell', 33500, 'active'),
('Homes For Sale Odessa/Midland', 'high', 'Home & Real Estate', 17600, 'active'),
('Midland Odessa Texas buy sell barter', 'high', 'Buy & Sell', 51500, 'active'),
('Midland Real Estate For Sale', 'high', 'Home & Real Estate', 2800, 'active'),
('Residencial & Commercial Odessa Tx', 'high', 'Construction & Trades', 2300, 'active'),
('Moms of MIDLAND/ODESSA TX', 'high', 'Family & Lifestyle', 1200, 'active'),
('West Texas Construction Needs', 'high', 'Construction & Trades', 5400, 'active'),
('Permain Basin Open Houses', 'high', 'Home & Real Estate', 1300, 'active'),
('ODESSA/MIDLAND TRADING POST', 'high', 'Buy & Sell', 5900, 'active'),

-- Tier 2 (Medium Priority) - Post 2x/week
('Friends of Midland and Odessa Tx', 'medium', 'Buy & Sell', 6300, 'active'),
('Sale & Post Anything Midland/Odess TX', 'medium', 'Buy & Sell', 13500, 'active'),
('Midland Texas Jobs', 'medium', 'Jobs & Services', 32200, 'active'),
('Midland & Odessa TEXAS Small Business', 'medium', 'Jobs & Services', 25100, 'active'),
('Odessa Texas JOBS', 'medium', 'Jobs & Services', 52000, 'active'),
('Old Midland', 'medium', 'Community', 37100, 'active'),
('Odessa-Midland jobs, sales, trades, and more', 'medium', 'Mixed', 22300, 'active'),
('Cubanos En Midland/Odessa', 'medium', 'Community', 19700, 'active'),
('Midessa Texas Kids N Family Happenings', 'medium', 'Family & Lifestyle', 11900, 'active'),
('Midland Texas Weekend Yard/garage Sales!', 'medium', 'Buy & Sell', 55300, 'active'),
('Best of Midland Texas Group', 'medium', 'Community', 7100, 'active'),
('West Texas women''s cave', 'medium', 'Family & Lifestyle', 52500, 'active'),
('Midland Tx trading post.', 'medium', 'Buy & Sell', 43600, 'active'),
('Free, Buy or Sell- Midland/Odess area', 'medium', 'Buy & Sell', 8400, 'active'),
('buy, sel, and trade-, Midland, Odessa, and Big Spring', 'medium', 'Buy & Sell', 6900, 'active'),
('Midland & Odessa Yard Sales', 'medium', 'Buy & Sell', 6600, 'active'),
('Odessa Texas', 'medium', 'Community', 3400, 'active'),
('Midland Texas', 'medium', 'Community', 3900, 'active'),
('Only Midland & Odessa Girls', 'medium', 'Family & Lifestyle', 3500, 'active'),
('ODESSA/MIDLAND News and Events', 'medium', 'Community', 7700, 'active'),
('Real Estate Investors Odessa Tx/Midland Tx', 'medium', 'Real Estate', 1400, 'active'),
('Just Sell It---Midland/Odessa', 'medium', 'Buy & Sell', 2600, 'active'),
('Now hiring💃🏃 odessa/midland/elpast tx', 'medium', 'Jobs', 6800, 'active'),
('Vintage Odessa/Midland Buy. Sell. Trade.', 'medium', 'Buy & Sell', 11500, 'active'),
('Finding Childcare/Babysitters/Nannies In Midland Texas', 'medium', 'Family', 8700, 'active'),
('Midland Texas 365 Happenings!', 'medium', 'Community', 626, 'active'),
('Midland & Odessa - Community Events for Children and Families', 'medium', 'Family', 3300, 'active'),
('Midland / Odessa Area Jobs', 'medium', 'Jobs', 8300, 'active'),
('Midland, TX Rentals, Apartments, Housing, Rooms, Sublets, Roommates', 'medium', 'Real Estate', 3300, 'active'),

-- Tier 3 (Low Priority) - Post 1x/2weeks
('Costco of Midland TX', 'low', 'Community', 16300, 'active'),
('Lost and Found Pets Midland/Odessa TX', 'low', 'Misc', 22700, 'active'),
('Texas (Odessa Midland', 'low', 'Misc', 11500, 'active'),
('West Texas cars, truck, etc... sales', 'low', 'Misc', 6000, 'active'),
('Midland/Odessa Fun stuff to do', 'low', 'Community', 4200, 'active');

-- Summary: 52 groups imported
-- Tier 1 (High): 18 groups - Post 3-4x/week
-- Tier 2 (Medium): 29 groups - Post 2x/week  
-- Tier 3 (Low): 5 groups - Post 1x/2weeks

