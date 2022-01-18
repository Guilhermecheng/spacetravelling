import { GetStaticPaths, GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom';
import ReactHtmlParser from 'react-html-parser'; 

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR/index';

import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {  

  console.log(post)
  const backgroundImg = post.data.banner.url;

  return (
    <div className={styles.postPage}>
      <div className={styles.postBanner} style={{ backgroundImage: `url(${backgroundImg})` }}></div>

      <div className={styles.postContent}>        
        <section className={commonStyles.contentContainer}>
          <h1>{post.data.title}</h1>
          <div className={styles.importantInfo}>

            <span>
              <FiCalendar />
              <p>{post.first_publication_date}</p>
            </span>

            <span>
              <FiUser />
              <p>{post.data.author}</p>
            </span>

            <span>
            <FiClock />
            <p>reading time</p> {/* to be calculated */}
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
                    {ReactHtmlParser(contentPart.body)}
                  </div>
                </div>
              )
            })}
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

export const getStaticProps: GetStaticProps = async context => {  
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(context.params?.slug), {});

  const content = response.data.content.map((eachContentPart) => {    
    const body = RichText.asHtml(eachContentPart.content_body)

    return {
      heading: eachContentPart.heading,
      body,
    }
  });

  const date = format(
    new Date(response.first_publication_date),
    "dd MMM yyyy",
    {
      locale: ptBR
    }
  )

  console.log(content)
  // treat response data
  const post = {
    first_publication_date: date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.nome_do_autor,
      content,
    }
  }

  return {
    props: { post }
  }
};
