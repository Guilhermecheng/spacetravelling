# spacetravelling
Spacetravelling is a blog about the programming world<br>
The platform is made for sharing simple ideas to the community

## Objective
This is a study project to learn and practice the use of Prismic API and also Next.js functions GetStaticProps and GetStaticPaths. 

## Design and functionality
### Home page

Home page, where all posts of the blog are listed. It lists the first 5 posts. If you want to see more, just click the "Carregar mais posts" button

<img src="https://user-images.githubusercontent.com/62719629/154522573-baba300b-0aaa-4ed0-af9b-88c66822bc1a.png" width="600px" />

**GetStaticProps function is used to fetch a list of posts (only first page).**

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

Other pages are added to the list as the user calls the "Carregar mais posts" button:

<img src="https://media.giphy.com/media/7HTndpgbHwjbjVEVlp/giphy.gif" />

As GettingStaticProps is called only when page is loading, a new function is called when getting more pages:

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

<div style="display: flex">
  <img src="https://user-images.githubusercontent.com/62719629/154524246-7213fe62-c9e0-49e2-9def-7d38188e046b.png" height="350px" /> &ensp; &ensp; &ensp;
  <img src="https://user-images.githubusercontent.com/62719629/154526190-b8f2a7ac-930d-49c4-a688-58bf976666ce.png" height="350px" />
</div>

It also uses GetStaticProps to get the post's info. Alongside, it also gets previous and next pages.

**Slug GetStaticProps**

```javascript
export const getStaticProps: GetStaticProps = async ({params, previewData, preview = false}) => {  
  const prismic = getPrismicClient();

  try {
    const response = await prismic.getByUID('posts', String(params.slug), {
      ref: previewData?.ref ?? null
    });
    
    // getting posts list for previous and next pages
    let gettingAllPages = await prismic.query([
      Prismic.Predicates.at('document.type', 'posts')
    ], {
      fetch: ['posts.title'],
      pageSize: 100,
      ref: previewData?.ref ?? null,
    });

    let allUids = gettingAllPages.results.map((post) => {
      return  { uid: post.uid, title: post.data.title }
    });

    let uidIndexes = allUids.map((post) => post.uid);
    let postIndex = uidIndexes.indexOf(params.slug as string);
    
    let prev: { uid: string; title: string } | null = null;
    let next: { uid: string; title: string } | null = null; 

    if(postIndex > 0) {
      next = allUids[postIndex - 1];
    } 

    if((postIndex + 1) < allUids.length) {
      prev = allUids[postIndex + 1];
    } 

    const post: Post = {
      first_publication_date: response.first_publication_date,
      last_publication_date: response.last_publication_date,
      data: {
        title: response.data.title,
        banner: {
          url: response.data.banner.url,
        },
        author: response.data.author,
        content: response.data.content.map((contentp) => {
          return {
            heading: contentp.heading,
            body: contentp.body,
          }
        })
      }
    }

    return {
      props: { post, preview, prev, next }
    }
  } catch(error) {
    throw error
  }
};
```

**GetstaticPaths:**
GetStaticPaths was also implemented, for better performance. It makes the application pre-load the first 5 posts (those which would be more accessed by users).

```javascript
export const getStaticPaths: GetStaticPaths = async () => {

  // buscar 5 primeiros posts (primeira pag) para deixar pre-rendered
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.'],
    pageSize: 5
  });

  const paths = posts.results.map((p) => {
    return {
      params: { slug: p.uid }
    }
  })
  
  return {
    paths,
    fallback: 'blocking'
  }
};

```

### Comments

Comments are powered by utteranc. The following is the Comments component, at the end of each post page

```javascript
export const getStaticProps: GetStaticProps = async ({
  params,
  previewData,
  preview = false,
}) => {  
  const prismic = getPrismicClient();

  try {
    const response = await prismic.getByUID('posts', String(params.slug), {
      ref: previewData?.ref ?? null
    });
    
    // getting posts list for previous and next pages
    let gettingAllPages = await prismic.query([
      Prismic.Predicates.at('document.type', 'posts')
    ], {
      fetch: ['posts.title'],
      pageSize: 100,
      ref: previewData?.ref ?? null,
    });

    let allUids = gettingAllPages.results.map((post) => {
      return  { uid: post.uid, title: post.data.title }
    });

    let uidIndexes = allUids.map((post) => post.uid);
    let postIndex = uidIndexes.indexOf(params.slug as string);
    
    let prev: { uid: string; title: string } | null = null;
    let next: { uid: string; title: string } | null = null; 

    if(postIndex > 0) {
      next = allUids[postIndex - 1];
    } 

    if((postIndex + 1) < allUids.length) {
      prev = allUids[postIndex + 1];
    } 

    const post: Post = {
      first_publication_date: response.first_publication_date,
      last_publication_date: response.last_publication_date,
      data: {
        title: response.data.title,
        banner: {
          url: response.data.banner.url,
        },
        author: response.data.author,
        content: response.data.content.map((contentp) => {
          return {
            heading: contentp.heading,
            body: contentp.body,
          }
        })
      }
    }

    return {
      props: { post, preview, prev, next }
    }
  } catch(error) {
    throw error
  }
};
```
### Conclusion

This project was a nice way to work with NextJS functionalities, like GetStaticProps and GetStaticPaths and  Prismic API.<br>
Project is not finished though: previous and next page buttons only work for the first 100 posts, as it uses a Prismic API response from:

```javascript
let gettingAllPages = await prismic.query([
      Prismic.Predicates.at('document.type', 'posts')
    ], {
      fetch: ['posts.title'],
      pageSize: 100,
      ref: previewData?.ref ?? null,
    });
```
If the application is used for more posts than these, a new functionality, to get more posts would need to be added
