import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

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
}

export default function Post({ post, preview }: PostProps) {  
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
  console.log(readingTime)
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
    fetch: ['posts.uid'],
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

    console.log(response)
    console.log(response.data.content)

    const post = {
      first_publication_date: response.first_publication_date,
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
      props: { post, preview }
    }
  } catch(error) {
    throw error
  }
};
