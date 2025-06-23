const getEnv = (name: string, required: boolean = true): string => {
    const value = process.env[name];
    if (!value || !required)
        throw new Error(`Missing environment variables of ${name}`);
    return value;
};

export default getEnv;
