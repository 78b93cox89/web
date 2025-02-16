export const useLinkColors = () => {
    return computed(() => {
        if (usePiniaStore().preferLight) {
            return {
                telegram: '#2c6aa3',
                blog: '#347985',
                someacg: '#5a4e41',
                moely: '#f724b9',
                cosine: '#535177',
                github: 'black',
            }
        } else {
            return {
                telegram: '#7db7ff',
                blog: '#39c5bb',
                someacg: '#f3dcbd',
                moely: '#f724b9',
                cosine: '#8a85c5',
                github: 'white',
            }
        }
    })
}