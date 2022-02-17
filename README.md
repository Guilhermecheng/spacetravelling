# spacetravelling
Spacetravelling is a blog about the programming world<br>
The platform is made for sharing simple ideas to the community

## Objective
This is a study project to learn and practice the use of Prismic API and also Next.js functions GetStaticProps and GetStaticPaths. 

## Design and functionality
### Home page

Home page, where all posts of the blog are listed. It lists the first 5 posts. If you want to see more, just click the "Carregar mais posts" button

<img src="https://user-images.githubusercontent.com/62719629/154522573-baba300b-0aaa-4ed0-af9b-88c66822bc1a.png" width="800px" />

GetStaticProps function is used to fetch a list of posts (only first page).

```javascript
export const getStaticProps: GetStaticProps<HomeProps> = async ({preview = false, previewData}) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 5,
    ref: previewData?.ref ?? null,
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: post.data,
      }
    })
  }

  return {
    props: { 
      postsPagination,
      preview
    }
  }
};
```

Other pages are added to the list as the user calls the "Carregar mais posts" button, which calls the following function:

```javascript
 async function fetchingNextPage(nextPage: string) {
    if(nextPage) {

      try {
        const response = await fetch(nextPage);
        const json = await response.json();
  
        const formattedResponse = formattingPostsList(json);
        setformattedPageList([...formattedPageList, ...formattedResponse]);
        setPrismicNextPage(json.next_page)      
        
      } catch(err) {
        console.log(err)
        throw err;
      }
    } 
  }
```

### Post page

Post pages are simple, getting an image, post creation info and the post itself. It also has a comment's section and previous / next page buttons:

<div style="display: flex; align-items: center">
  <img src="https://user-images.githubusercontent.com/62719629/154524246-7213fe62-c9e0-49e2-9def-7d38188e046b.png" height="350px" />
  <img src="https://user-images.githubusercontent.com/62719629/154526190-b8f2a7ac-930d-49c4-a688-58bf976666ce.png" height="350px" />
</div>

It also uses GetStaticProps to get the post's info:

```javascript

```
