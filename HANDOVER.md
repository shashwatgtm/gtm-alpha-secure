# Job E handover

17 November 2026. Branch cut from dea509e.

Connected roadmap call with primary_focus I and timeframe 120-day returned a 90 day default labelled not supplied. The same happened with horizon_days 120.

The failing regression is in tests/roadmap-horizon.test.mjs. It ran against the base handler using offline adapters for unavailable runtime packages. It failed on the buyer facing result. Next: complete implementation, run the same test and the field matrix, compare the full suites and record release instructions.
