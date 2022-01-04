import { GetStaticProps } from 'next';
import Head from 'next/head';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { FiUser, FiCalendar } from 'react-icons/fi';

import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR/index';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ pagePosts }: any) {
  return (
    <>
      <Head>
        <title>Home | spacetravelling</title>
      </Head>

      <main className={styles.home}>
        <div className={styles.postsList}>
          {
            pagePosts.map((page_post) => {
              return(
                <Link href={`/post/${page_post.uid}`} key={page_post.uid}>

                  <a key={page_post.uid} className={styles.postItem}>

                    <h1>{page_post.data.title}</h1>
                    
                    <p>{page_post.data.subtitle}</p>

                    <div className={styles.postCreationInfo}>
                      <span>
                        <FiCalendar />
                        <p>{page_post.first_publication_date}</p>
                      </span>
                      
                      <span>
                        <FiUser />
                        <p>{page_post.data.author}</p>
                      </span>
                      
                    </div>
                  </a>
                </Link>
              )
            })
          }
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.nome_do_autor']
  });

  const pagePosts = postsResponse.results.map(post => {
    const formattedPublicationDate = format(
      new Date(post.first_publication_date),
      "dd MMM yyyy",
      {
        locale: ptBR
      }
    )

    return {
      uid:post.uid,
      first_publication_date: formattedPublicationDate,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.nome_do_autor,        
      }, 
    }
  })

  return {
    props: { pagePosts }
  }
};
