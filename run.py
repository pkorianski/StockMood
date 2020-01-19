"""
Moods: Great, Good, Eh, Stay away

How to run: python3 run.py -name {companys ticker} -timeframe {days}
            IE:
<<<<<<< HEAD
            python3 run.py
=======
            python3 run.py -name CVS -timeframe 0
>>>>>>> a8e941ce60d4a81fb9d3d366f1206e1b815e147b

"""
# Imports
from StockMood import StockMood

if __name__ == '__main__':
    sm = StockMood("CVS", 0)
    print(sm.results())
