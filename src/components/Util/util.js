export const setErrorStyle = (name) => {
    return { 
        borderColor: name ? 'red' : '', 
        boxShadow: name ? '0 0 1.5px 1px red' : '' 
    }
}