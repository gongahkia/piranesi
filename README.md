[![](https://img.shields.io/badge/piranesi_1.0.0-up-green)](https://github.com/gongahkia/piranesi/releases/tag/1.0.0)
  
# `Piranesi` 🏛️

Physical book collections are awesome. Virtual libraries should be too.

## Usage

Explore the [Piranesi web app universe 🚀](./app/) by clicking below.   
  
There are currently 3 galaxies to explore. 🌌

<pre>
          <a href="./app/naive-piranesi/">naive-piranesi</a>     <a href="./app/smart-piranesi/">smart-piranesi</a>                    _______
|\   \\\\__     o                  .                      ,-~~~       ~~~-,
| \_/    o \    o                 ":"                    (  <a href="./app/chic-piranesi/">chic-piranesi</a>  )
> _   (( <_  oo                 ___:____     |"\/"|       \_-, , , , , ,-_/
| / \__+___/                  ,'        `.    \  /           / / | | \ \
|/     |/                     |  O        \___/  |           | | | | | |
                           ~^~^~^~^~^~^~^~^~^~^~^~^~         | | | | | |
                                                            / / /   \ \ \
                                                            | | |   | | |
</pre>

## Architecture 

Data is written and stored to [Supabase](https://supabase.com/) per the below schema.

### DB

```mermaid
erDiagram
    USER {
        uuid id PK
        string email
        string username
        timestamp created_at
    }
    BOOK {
        string olid PK "OpenLibrary ID"
        string title
        string author
        int publish_year
        string cover_url
    }
    USER_BOOK {
        uuid user_id FK
        string book_olid FK
        timestamp added_at
        string notes
    }

    USER ||--o{ USER_BOOK : "saves"
    BOOK ||--o{ USER_BOOK : "saved by"
```

### Overview

```mermaid
sequenceDiagram
    actor User
    participant NextJS as NextJS Frontend
    participant OpenLibrary as OpenLibrary API
    participant FastAPI as FastAPI Backend
    participant Supabase as Supabase Database

    User->>NextJS: Search for books
    NextJS->>OpenLibrary: Request book data
    OpenLibrary-->>NextJS: Return book data
    NextJS-->>User: Display book results
    User->>NextJS: Select books to save
    NextJS->>FastAPI: Send selected books
    FastAPI->>Supabase: Store user's books
    Supabase-->>FastAPI: Confirm storage
    FastAPI-->>NextJS: Confirm save
    NextJS-->>User: Display confirmation

    User->>NextJS: Request saved books
    NextJS->>FastAPI: Get user's books
    FastAPI->>Supabase: Retrieve user's books
    Supabase-->>FastAPI: Return user's books
    FastAPI-->>NextJS: Send user's books
    NextJS-->>User: Display saved books
```

## References

The name `Piranesi` is in reference to the [18th century](https://en.wikipedia.org/wiki/1720) Italian archaeologist and architect [Giovanni Battista Piranesi](https://en.wikipedia.org/wiki/Giovanni_Battista_Piranesi), most known for his collection of 16 etchings, [Carceri d'invenzione](https://en.wikipedia.org/wiki/Carceri_d%27invenzione), often translated as [Imaginary Prisons](https://artmuseum.princeton.edu/object-package/giovanni-battista-piranesi-imaginary-prisons/3640).  

![](./asset/logo/prison.jpg)