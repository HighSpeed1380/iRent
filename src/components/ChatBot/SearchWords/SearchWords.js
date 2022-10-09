import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './SearchWords.css';

const URL_REQUEST = 'https://myirent.com/NodeJS/iRent/chatbot';

const SearchWords = (props) => {
    const [ loading, setLoading ] = useState(true);
    const { setState } = props;

    useEffect(() => {
        async function fetchData() {
            const data = {
                sentence: props.sentence
            };
          
            await axios.post(`${URL_REQUEST}/getVideos`, { data })
                .then((res) => {
                    setState(state =>({
                        ...state,
                        search: res.data
                    }));
                    setLoading(false);
                })
                .catch((err) =>{
                    console.log(err);
                })
        }
        fetchData();
    }, []);

    const render = () => {
        if(props.search.length > 0) {
            const linkMarkup = props.search.map((link) => (
                <li key={link.id} className="link-list-item">
                  <a
                    href={link.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-list-item-url"
                    onClick
                  >
                    {link.name}
                  </a>
                </li>
            ));
            
            return <ul className="link-list">{linkMarkup}</ul>;
        } else {
            return (
                <div style={{backgroundColor: "#f1f1f1", color: "#585858"}}>
                    We were unable to find a tutorial for: {props.sentence}. <br/>Please, contact us:
                    <a href="mailto:support@myirent.com"> support@myirent.com</a>
                </div>
            )
        }
    }

    if(!loading)
        return render()
    else
        return <p></p>
}

export default SearchWords;