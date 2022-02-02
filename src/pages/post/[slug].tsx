import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';


import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom';
import ReactHtmlParser from 'react-html-parser'; 

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR/index';

import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Comments from '../../components/Comments';
import { ExitPreviewButton } from '../../components/ExitPreviewButton';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[]
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
  prev: { uid: string; title: string } | null;
  next: { uid: string; title: string } | null;
}

export default function Post({ post, preview, prev, next }: PostProps) {  
  const router = useRouter();
  if(router.isFallback) {
    return <div className={styles.loading}><h1>Carregando...</h1></div>
  }

  function timeCalculate(post: Post) {
    const timeCalc: number[] = post.data.content.map((contentPart) => {
      const reducer = contentPart.body.reduce((a, b) => {
        const count = b.text.split(' ').length
        return a + count
      }, 0);
      return reducer
    })

    return Math.ceil((timeCalc.reduce((a: number, b: number) => a + b, 0))/200);
  }

  const backgroundImg = post.data.banner.url;
  const readingTime = timeCalculate(post); 

  const formattedDate = format(
    new Date(post.first_publication_date),
    "dd MMM yyyy",
    {
      locale: ptBR
    }
  )

  return (
    <div className={styles.postPage}>
      <div className={styles.postBanner} style={{ backgroundImage: `url(${backgroundImg})` }}></div>

      <div className={styles.postContent}>        
        <section className={commonStyles.contentContainer}>
          <h1>{post.data.title}</h1>
          <div className={styles.importantInfo}>

            <span>
              <FiCalendar />
              <p>{formattedDate}</p>              
            </span>

            <span>
              <FiUser />
              <p>{post.data.author}</p>
            </span>

            <span>
            <FiClock />
            <p>{readingTime} min</p>
            </span>
          </div>
          
          {post.last_publication_date && 
            (
              <p className={styles.lastFormattedDate}>
                {
                  format(
                    new Date(post.last_publication_date),
                    "'*editado 'd MMM yyyy' às 'p'",
                    {
                      locale: ptBR,
                    }
                  ) 
                }
              </p>
            )         
          }

          <section className={styles.contentSection}>
            {post.data.content.map((contentPart) => {
              
              return (
                <div key={contentPart.heading}>
                  <h3 className={styles.contentBodySubtitle}>
                    {contentPart.heading}
                  </h3>

                  <div className={styles.contentBodyText}>
                    {ReactHtmlParser(RichText.asText(contentPart.body))}
                  </div>
                </div>
              )
            })}
          </section>

          <section className={styles.nextAndComments}>            
            <div className={styles.nextAndPreview}>
              {prev ? (
                <Link href={`/post/${prev.uid}`}>
                  <div className={styles.previousButton}>
                    { prev.title }
                    <span>Post anterior</span>
                  </div>
                </Link>
              ) : (
                <div></div>
              )}
              
              {next && (
                <Link href={`/post/${next.uid}`}>
                  <div className={styles.nextButton}>
                    { next.title }
                    <span>Próximo post</span>
                  </div>
                </Link>
              )}
            </div>

            <Comments />

            {preview && <ExitPreviewButton /> }
          </section>
        </section>
      </div>      
    </div>
  )
}

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

// const nextPost = (
//   await prismic.query(Prismic.predicates.at('document.type', 'post'), {
//     pageSize: 1,
//     after: `${response.id}`,
//     orderings: '[document.first_publication_date desc]',
//     fetch: ['post.uid', 'post.title'],
//   })
// ).results[0];

// const prevPost = (
//   await prismic.query(Prismic.predicates.at('document.type', 'post'), {
//     pageSize: 1,
//     after: `${response.id}`,
//     orderings: '[document.first_publication_date]',
//     fetch: ['post.uid', 'post.title'],
//   })
// ).results[0];
