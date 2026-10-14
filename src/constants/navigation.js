export const PRIMARY_NAV = [
    { label: 'Home', to: '/Home', route: 'home' },
    {
        label: 'Who We Are',
        to: '/Who-We-Are',
        route: 'who',
        children: [
            { label: 'About Us', to: '/Who-We-Are' },
            { label: 'What We Do', to: '/Who-We-Are#what-we-do' },
        ],
    },
    {
        label: 'SCD Lab',
        to: '/Lab',
        route: 'lab',
        children: [
            { label: 'About Lab', to: '/Lab' },
            { label: 'Research', to: '/Lab/Research' },
            { label: 'Projects', to: '/Lab/Projects' },
            { label: 'Apps & Tools', to: '/Lab/Apps-Tools' },
        ],
    },
    {
        label: 'SCD Society',
        to: '/Society',
        route: 'society',
        children: [
            { label: 'About Society', to: '/Society' },
            { label: 'Events', to: '/Society/Events' },
        ],
    },
    {
        label: 'SCD Research Academy',
        to: '/Academy',
        route: 'academy',
        children: [
            { label: 'About Academy', to: '/Academy' },
            { label: 'Tutorials', to: '/Academy/tutorials' },
            { label: 'Instructor-led labs', to: '/Academy/labs' },
            { label: 'Recorded lectures', to: '/Academy/lectures' },
            { label: 'Spatial data', to: '/Academy/data' },
        ],
    },
    { label: 'People', to: '/People', route: 'people' },
];
