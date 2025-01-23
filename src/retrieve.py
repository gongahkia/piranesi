"""
!NOTE

relies on openlibrary RESTAPI to obtain book details
"""

# ----- REQUIRED IMPORTS -----

import json
import requests

# ----- HELPER FUNCTIONS -----


def write_json(data, filepath):
    """
    write json data to a file
    """
    try:
        with open(filepath, "w", encoding="utf-8") as file:
            json.dump(data, file, ensure_ascii=False, indent=4)
        return True
    except Exception as e:
        print(f"Error during writing json to filepath {filepath}: {str(e)}")
        return False


def search_books_by_query(query):
    """
    search for books from the openlibrary RESTAPI
    """
    try:
        search_url = f"https://openlibrary.org/search.json?q={query}"
        response = requests.get(search_url)
        data = response.json()
        print(data)
        return (True, data)
    except Exception as e:
        print(f"Error during search: {str(e)}")
        return (False, None)


def search_books_by_id(book_id):
    """
    get book details from the openlibrary RESTAPI
    """
    try:
        book_url = f"https://openlibrary.org/works/{book_id}.json"
        response = requests.get(book_url)
        book_data = response.json()
        print(book_data)
        return (True, book_data)
    except Exception as e:
        print(f"Error during book details: {str(e)}")
        return (False, None)


def search_books_by_query_wrapper(query, filepath_prefix="./../corpus/log/"):
    """
    wrapper function for search_books_by_query
    """
    modified_query = query.lower().replace(" ", "+")
    print(modified_query)
    search_results = search_books_by_query(modified_query)
    if search_results[0]:
        write_json(search_results[1], f"{filepath_prefix}{modified_query}.json")
        return True
    else:
        return False


def search_books_by_id_wrapper(book_id, filepath_prefix="./../corpus/log/"):
    """
    wrapper function for search_books_by_id
    """
    search_results = search_books_by_id(book_id)
    if search_results[0]:
        write_json(search_results[1], f"{filepath_prefix}{book_id}.json")
        return True
    else:
        return False


# ----- SAMPLE EXECUTION CODE -----

if __name__ == "__main__":
    search_books_by_query_wrapper("What i talk about when I talk about running")
