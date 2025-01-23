"""
!NOTE

relies on openlibrary RESTAPI to obtain book details

docs are https://openlibrary.org/dev/docs/restful_api
"""

# ----- REQUIRED IMPORTS -----

import os
import cv2
import json
import requests
import numpy as np

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


def search_book_cover_by_isbn(isbn, filepath, size="L"):
    """
    get book cover from the openlibrary RESTAPI, where size can be S, M, L
    """
    try:
        book_url = f"https://covers.openlibrary.org/b/isbn/{isbn}-{size}.jpg"
        response = requests.get(book_url, stream=True)
        response.raise_for_status()
        with open(filepath, "wb") as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        return (True, f"Image saved successfully to {filepath}")
    except Exception as e:
        return (False, f"Error downloading image: {str(e)}")


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


def search_book_cover_wrapper(query, book_limit=5, filepath_prefix="./../corpus/log/"):
    """
    wrapper function for search_books_by_query and search_book_cover_by_isbn
    """
    modified_query = query.lower().replace(" ", "+")
    search_results = search_books_by_query(modified_query)
    cover_count = 0
    if search_results[0]:
        for book in search_results[1]["docs"]:
            if cover_count >= book_limit:
                break
            if book["isbn"] and len(book["isbn"]) > 0:
                book_isbn = book["isbn"][0]
                search_results = search_book_cover_by_isbn(
                    book_isbn, f"{filepath_prefix}{modified_query}{book_isbn}.jpg"
                )
            else:
                print("Error: No ISBN found for this book.")
                return False
            cover_count += 1
        return True
    else:
        return False


# ----- SAMPLE EXECUTION CODE -----

if __name__ == "__main__":
    # search_books_by_query_wrapper("What i talk about when I talk about running")
    search_book_cover_wrapper("What i talk about when I talk about running", 3)
