"""
StockMood is a script to help analyze one companys stock which current
includes investigating news, social media, and stock traits

Moods: Great(3), Good(2), Eh(1), Stay away(0)

"""

# Imports
import statistics


class StockMood:
    def __init__(self, name, timeframe):
        self.name = name
        self.timeframe = timeframe

    def get_stock_info(self):
        """
        Scrape Market data in the companys stock
        """
        # Return variables
        stock_price = 0
        dividend_yield = 0
        growth_rate = 0
        avg_dividend = 0
        pe_ratio = 0
        epr = 0
        roe = 0

        # TODO: Get stock data

        return {
            "stock_price": stock_price,
            "dividend_yield": dividend_yield,
            "growth_rate": growth_rate,
            "avg_dividend": avg_dividend,
            "pe_ratio": pe_ratio,
            "epr": epr,
            "roe": roe
        }

    def get_stock_media(self):
        """
        Scrape Google for news articles on the company
        """
        # Return variables
        stock_media = list()

        # TODO: Get Stock media

        return stock_media

    def get_stock_social(self):
        """
        Scrape Twitter for company specific tweets 
        """
        # Return variables
        stock_social = list()

        # TODO: Get Stock social tweets

        return stock_social

    def find_mood(self, src):
        """
        Use AI algorithm to analyze mood of text
        """
        # Return variables
        mood = str()

        # TODO: Find text mood algorithm

        return mood

    def calculate_moods(self):
        """
        Find the moods of the stock_info, media, and social
        """
        # Get info (list of data)
        stock_media_data = self.get_stock_media()
        stock_social_data = self.get_stock_social()

        def find_data_mood(data_src):
            mood_list = list()

            # Loop through data sources and find mood
            for i in data_src:
                mood = self.find_mood(i)
                mood_list.append(mood)

            if mood_list:
                # Find the average mood
                avg_mood = sum(mood_list) / len(mood_list)

                # Find the median mood
                med_mood = statistics.median(mood_list)
            else:
                avg_mood, med_mood = 0, 0

            return {
                "average": avg_mood,
                "median": med_mood
            }

        # TODO : Make these multithreaded so one doesnt wait on another to run

        # Find data mood (Stock Media)
        stock_media_mood = find_data_mood(stock_media_data)

        # Find data mood (Stock Social)
        stock_social_mood = find_data_mood(stock_social_data)

        return {
            "stock_media_mood": stock_media_mood,
            "stock_social_mood": stock_social_mood
        }

    def results(self):
        # Return variables
        stock_price = None
        dividend_yield = None
        growth_rate = None
        avg_dividend = None
        pe_ratio = None
        epr = None
        roe = None
        stock_media_mood = None
        stock_social_mood = None

        # Retrieving data
        dataset_moods = self.calculate_moods()
        stock_data = self.get_stock_info()
        stock_media_mood = dataset_moods["stock_media_mood"]
        stock_social_mood = dataset_moods["stock_social_mood"]
        stock_price = stock_data["stock_price"]

        # Analyzing stock data
        # Dividend yield
        if (stock_data["dividend_yield"] >= 0.03 and
                stock_data["dividend_yield"] <= 0.04):
            dividend_yield = True
        else:
            dividend_yield = False

        # Growth rate
        if (stock_data["growth_rate"] >= 0.05 and
                stock_data["growth_rate"] <= 0.08):
            growth_rate = True
        else:
            growth_rate = False

        # Dividend yield above 5yr average
        if (stock_data["dividend_yield"] > stock_data["avg_dividend"]):
            avg_dividend = True
        else:
            avg_dividend = False

        # Price-to-Earnings Ratio
         # Growth rate
        if (stock_data["pe_ratio"] <= stock_data["avg_dividend"] and
                stock_data["pe_ratio"] < 0.20):
            pe_ratio = True
        else:
            pe_ratio = False

        # Earning-Payout-Ratio
        if (stock_data["epr"] <= 0.40):
            epr = True
        else:
            epr = False

        # Return-on-Equity
        if (stock_data["roe"] > 0.09):
            roe = True
        else:
            roe = True

        return {
            "name": self.name,
            "timeframe": self.timeframe,
            "stock_price": stock_price,
            "dividend_yield": dividend_yield,
            "growth_rate": growth_rate,
            "avg_dividend": avg_dividend,
            "pe_ratio": pe_ratio,
            "epr": epr,
            "roe": roe,
            "stock_media_mood": stock_media_mood,
            "stock_social_mood": stock_social_mood
        }
