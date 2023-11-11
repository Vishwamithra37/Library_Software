import datetime
def strip_final_space(dictionary:dict):
    """Strips the final space from a dictionary

    Keyword arguments:
    dictionary -- the dictionary to be stripped
    Returns:
    dictionary -- the stripped dictionary
    """
    for key in dictionary:
        dictionary[key] = dictionary[key].strip()
    return dictionary
def convert_all_values_to_string_for_json(dictionary: dict):
    """Converts all values in a dictionary to string for JSON

    Keyword arguments:
    dictionary -- the dictionary to be converted
    Returns:
    dictionary -- the converted dictionary
    """
    for key in dictionary:
        dictionary[key] = str(dictionary[key])
    return dictionary

def calculate_time_difference(time1: datetime.datetime):
    """Calculates the time difference between two datetime objects

    Keyword arguments:
    time1 -- the first datetime object
    time2 -- the second datetime object
    Returns:
    time_difference -- the time difference between the two datetime objects in days (Integer)
    """
    current_time = datetime.datetime.now()
    time_difference = current_time - time1
    time_difference = time_difference.days
    return int(time_difference)