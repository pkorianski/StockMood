"""
Moods: Great, Good, Eh, Stay away

How to run: python3 run.py -name {companys ticker} -timeframe {days}
            IE:
            python3 run.py -name CVS -timeframe 0

"""
# Imports
from StockMood import StockMood

if __name__ == '__main__':
    sm = StockMood("CVS", 0)
    print(sm.results())
