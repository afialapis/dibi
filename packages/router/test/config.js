const TEST_01_RECORDS= [
  {name: 'Peter', description: 'A simple man', counter: 91},
  {name: 'Harry', description: 'A dirty man' , counter: 99},
  {name: 'James', description: 'A golden man', counter: 99},
  {name: 'Jonny', description: 'A rocker man', counter: 46},
]

export default {
  db: {
    dialect:  'postgres',
    host:     'localhost',
    port:     5432,
    database: 'dibi',
    user:     'postgres',
    password: 'postgres'
  },
  data: TEST_01_RECORDS,
  server: {
    port: 3001,
    url: '/api'
  }
}
