import type {Chat, Profile, RawChat} from 'interfaces'
import {sendRequest} from 'utils'
import {API_URL} from 'interfaces'
import {v4} from 'uuid'

class CArray<T> extends Array<T>{
  
  sortBy(prop:keyof T, reverse:boolean=false){
    if(!this.length) return this
    if(!(prop in this[0])) return this
    const sortMod = reverse ? -1 : 1
    const sort = (a: unknown, b: unknown) => {
      return a[prop] < b[prop] ? -1 * sortMod
          : a[prop] > b[prop] ? 1 * sortMod
          : 0
    }
    this.sort(sort)
    return this
  }

  
  // pick<P extends keyof T>(...prop: P[]){
  //   return this.map(v=>{
  //     return prop.reduce((prev, cur)=>{
  //       return {...prev, [cur]: v[cur]}
  //     }, {}) as Pick<T, P>
  //   })
  // }

  // throw<P extends keyof T>(...prop: P[]){
  //   return this.map(v=>{
  //     return Object.keys(v).reduce((prev, cur)=>{
  //       return prop.includes(cur as unknown as P) ? prev : {...prev, [cur]:v[cur]}
  //     }, {}) as Omit<T, P>
  //   })
  // }
}



function every<T>(obj1:T|Comparator<T>, obj2:T ):boolean{
  if(isComparator(obj1)) return obj1(obj2)
  if (typeof obj1 === "object") {
    return Object.keys(obj1).every(key=>{
      const prop1 = obj1[key]
      const prop2 = obj1[key]
      return every(prop1, prop2)
    })
  }
  return obj1 === obj2
}

function some<T>(obj1:T|Comparator<T>, obj2:T ):boolean{
  if(isComparator(obj1)) return obj1(obj2)
  if (typeof obj1 === "object") {
    return Object.keys(obj1).some(key=>{
      const prop1 = obj1[key]
      const prop2 = obj1[key]
      return some(prop1, prop2)
    })
  }
  return obj1 === obj2
}

function isComparator<T>(a:unknown): a is Comparator<T>{
  return typeof a === "function"
}

type Comparator<T> = (v:T)=>boolean

type DataRecord<T> = {
  $pk: number
  update: (data:Partial<T>)=>Promise<void>
  delete: ()=>Promise<void>
}

type CursorOption<T> = {
  index?:keyof T
  direction?:IDBCursorDirection
}

type RecordQuery<T> = {
  [P in keyof T]: T[P] | Comparator<T[P]>
}


export class TableStore<T> {
  #name: string
  #db:IDBDatabase
  constructor(name:string, db:IDBDatabase) {
    this.#name = name
    this.#db = db
  }

  #tx(mode: IDBTransactionMode = "readwrite"):IDBTransaction{
    return this.#db.transaction(this.#name, mode)
  }

  search(record: RecordQuery<Partial<T>>, {index, direction}:CursorOption<T>={}): Promise<CArray<T & DataRecord<T>>> {
    const matches: CArray<T & DataRecord<T>> = new CArray()
    const tx = this.#tx('readonly')
    return new Promise((resolve, reject) => {
      const cursor = index
      ? tx.objectStore(this.#name).index(index as string).openCursor(null, direction) 
      : tx.objectStore(this.#name).openCursor(null, direction)
      if(Object.keys(record).length === 0) resolve(matches)
      cursor.onsuccess = () => {
        const c = cursor.result
        if (c) {
          const value = c.value as T
          const pk = c.primaryKey as number
          const match = some(record, value)
          if(match) matches.push(
            {
              ...value,
              $pk: pk,
              update: (data)=> {
                const toUpdate = {...value, ...data}
                return this.update(pk, toUpdate)
              },
              delete: ()=> this.delete(pk)
            }
          )
          c.continue()
        }
      }
      tx.oncomplete = ()=> resolve(matches)
      tx.onerror = e=> reject(e)
      cursor.onerror = e => reject(e)
    })
  }

  searchOne(record: RecordQuery<Partial<T>>, {index, direction}:CursorOption<T>={}): Promise<(T & DataRecord<T>) | null> {
    let data:T & DataRecord<T> 
    const tx = this.#tx('readonly')
    return new Promise((resolve, reject) => {
      const cursor = index
      ? tx.objectStore(this.#name).index(index as string).openCursor(null, direction) 
      : tx.objectStore(this.#name).openCursor(null, direction)
      if(Object.keys(record).length === 0) resolve(null)
      cursor.onsuccess = () => {
        const c = cursor.result
        if (c) {
          const value = c.value as T
          const pk = c.primaryKey as number
          const match = some(record, value)
          if (match) {
            data = {
              ...value,
              $pk: pk,
              update: (data)=> this.update(pk, {...value, ...data}),
              delete: ()=> this.delete(pk)
            }
            return
          }
          c.continue()
        }
      }
      tx.oncomplete = ()=> resolve(data)
      tx.onerror = e=> reject(e)
      cursor.onerror = e => reject(e)
    })
  }


  find(record: RecordQuery<Partial<T>>, {index, direction}:CursorOption<T>={}): Promise<CArray<T & DataRecord<T>>> {
    const matches: CArray<T & DataRecord<T>> = new CArray()
    const tx = this.#tx('readonly')
    return new Promise((resolve, reject) => {
      const cursor = index
      ? tx.objectStore(this.#name).index(index as string).openCursor(null, direction) 
      : tx.objectStore(this.#name).openCursor(null, direction)
      if(Object.keys(record).length === 0) resolve(matches)
      cursor.onsuccess = () => {
        const c = cursor.result
        if (c) {
          const value = c.value as T
          const pk = c.primaryKey as number
          const match = every(record, value)
          if(match) matches.push(
            {
              ...value,
              $pk: pk,
              update: (data)=> {
                const toUpdate = {...value, ...data}
                return this.update(pk, toUpdate)
              },
              delete: ()=> this.delete(pk)
            }
          )
          c.continue()
        }
      }
      tx.oncomplete = ()=> resolve(matches)
      tx.onerror = e=> reject(e)
      cursor.onerror = e => reject(e)
    })
  }

  findOne(record: RecordQuery<Partial<T>>, {index, direction}:CursorOption<T>={}): Promise<(T & DataRecord<T>) | null> {
    let data:T & DataRecord<T> 
    const tx = this.#tx('readonly')
    return new Promise((resolve, reject) => {
      const cursor = index
      ? tx.objectStore(this.#name).index(index as string).openCursor(null, direction) 
      : tx.objectStore(this.#name).openCursor(null, direction)
      if(Object.keys(record).length === 0) resolve(null)
      cursor.onsuccess = () => {
        const c = cursor.result
        if (c) {
          const value = c.value as T
          const pk = c.primaryKey as number
          const match = every(record, value)
          if (match) {
            data = {
              ...value,
              $pk: pk,
              update: (data)=> this.update(pk, {...value, ...data}),
              delete: ()=> this.delete(pk)
            }
            return
          }
          c.continue()
        }
      }
      tx.oncomplete = ()=> resolve(data)
      tx.onerror = e=> reject(e)
      cursor.onerror = e => reject(e)
    })
  }

  includes(record: RecordQuery<Partial<T>>): Promise<boolean> {
    let result = false
    const tx = this.#tx('readonly')
    return new Promise((resolve, reject) => {
      const cursor = tx.objectStore(this.#name).openCursor()
      cursor.onerror = e => reject(e)
      cursor.onsuccess = () => {
        const c = cursor.result
        if (!c) return
        else {
          const match = every(record, c.value)
          if(match) return result = true
          c.continue()
        }
      }
      tx.oncomplete = ()=> resolve(result)
      tx.onerror = e=> reject(e)
    })
  }

  has(record: RecordQuery<Partial<T>>): Promise<boolean> {
    let result = false
    const tx = this.#tx('readonly')
    return new Promise((resolve, reject) => {
      const cursor = tx.objectStore(this.#name).openCursor()
      cursor.onerror = e => reject(e)
      cursor.onsuccess = () => {
        const c = cursor.result
        if (!c) return
        else {
          const match = some(record, c.value)
          if(match) return result = true
          c.continue()
        }
      }
      tx.oncomplete = ()=> resolve(result)
      tx.onerror = e=> reject(e)
    })
  }

  async insertOne(data: T):Promise<void> {
    const tx = this.#tx()
    return new Promise((resolve, reject)=>{
      const req = tx.objectStore(this.#name).add(data)
      req.onerror = e => reject(e)
      req.onsuccess =  _=>
      tx.onerror = e => reject(e)
      tx.oncomplete = _=>resolve()
    })


    
  }

  async insertMany(data: T[]){
    const many = data.map(async i => await this.insertOne(i))
    return Promise.all(many)
  }

  async delete($pk: number):Promise<void> {
    const tx = this.#tx()
    return new Promise((resolve, reject)=>{
      const req = tx.objectStore(this.#name).delete($pk)
      req.onsuccess = ()=>
      req.onerror = e => reject(e)
      tx.oncomplete = ()=> resolve()
      tx.onerror = e=> reject(e)
    })
  }

  deleteMany($pk: Set<number>){
    const toDelete = [...$pk].map(async i => this.delete(i))
    return Promise.all(toDelete)
  }

  update($pk: number, data: T):Promise<void> {
    const tx = this.#tx()
    return new Promise((resolve, reject)=>{
      const req = tx.objectStore(this.#name).put(data, $pk)
      req.onsuccess = () => 
      req.onerror = e => reject(e)
      tx.oncomplete = ()=> resolve()
      tx.onerror = e=> reject(e)
    })
  }

  updateMany(PK_Data_Pair: Map<number, T>){
    const toUpdate = [...PK_Data_Pair.entries()].map(async ([pk, data])=>{
      await this.update(pk, data)
    })
    return Promise.all(toUpdate)
  }

  clear():Promise<void>{
    const tx = this.#tx()
    return new Promise((resolve, reject)=>{
      const clear = tx.objectStore(this.#name).clear()
      clear.onerror = e => reject(e)
      clear.onsuccess = _=>
      tx.oncomplete = ()=> resolve()
      tx.onerror = e=> reject(e)
    })
  }

  count():Promise<number>{
    const tx =this.#tx('readonly')
    return new Promise((resolve, reject)=>{
      const c = tx.objectStore(this.#name).count()
      c.onsuccess = ()=> 
      c.onerror = e => reject(e)
      tx.oncomplete = ()=> resolve(c.result)
      tx.onerror = e=> reject(e)
    })
  }

  get($pk: number):Promise<(T & DataRecord<T>)|null>{ 
    let data:T & DataRecord<T>
    const tx = this.#tx("readonly")
    return new Promise((resolve, reject)=>{
      const cursor = tx.objectStore(this.#name).openCursor()
      const req = tx.objectStore(this.#name).get($pk)
      cursor.onsuccess = ()=>{
        const value = req.result as T
        data = {
          ...value,
          $pk,
          update: data=>{
            const toUpdate = Object.assign(value, data)
            return this.update($pk, toUpdate)
          },
          delete: ()=> this.delete($pk)
        }
        return
      }
      tx.oncomplete = ()=> resolve(data)
      tx.onerror = e=> reject(e)
      cursor.onerror = e => reject(e)
    })
  }

  async getMany($pk: Set<number>):Promise<CArray<T & DataRecord<T>>> {
    const toGet = [...$pk].map(pk=>this.get(pk))
    return new CArray(...await Promise.all(toGet))
  }

  all({index, direction}:CursorOption<T>={}):Promise<CArray<T & {$pk: number}>>{
    const tx = this.#tx("readonly")
    const values: CArray<T & {$pk: number}> = new CArray()
    return new Promise((resolve, reject) => {
      const cursor = index
      ? tx.objectStore(this.#name).index(index as string).openCursor(null, direction) 
      : tx.objectStore(this.#name).openCursor(null, direction)
      cursor.onsuccess = () => {
        const c = cursor.result
        if (c) {
          values.push({...c.value, $pk:c.primaryKey})
          c.continue()
        }
      }
      tx.oncomplete = ()=> resolve(values)
      tx.onerror = e=> reject(e)
      cursor.onerror = e => reject(e)
    })
  }

  retrieve<K>(get: (data: T) => K | void, {index, direction}:CursorOption<T>={}): Promise<CArray<K>> {
    const values: CArray<K> = new CArray()
    const tx = this.#tx("readonly")
    return new Promise((resolve, reject) => {
      const cursor = index
      ? tx.objectStore(this.#name).index(index as string).openCursor(null, direction) 
      : tx.objectStore(this.#name).openCursor(null, direction)
      cursor.onsuccess = () => {
        const c = cursor.result
        if (c) {
          const data = get(c.value)
          if (data !== undefined) values.push(data as K)
          c.continue()
        }
      }

      tx.oncomplete = ()=> resolve(values)
      tx.onerror = e=> reject(e)
      cursor.onerror = e => reject(e)
    })
  }

  retrieveOne<K>(get: (data: T) => K | void, {index, direction}:CursorOption<T>={}): Promise<K | null> {
    let data:K = null
    const tx = this.#tx("readonly")
    return new Promise((resolve, reject) => {
      const cursor = index
      ? tx.objectStore(this.#name).index(index as string).openCursor(null, direction) 
      : tx.objectStore(this.#name).openCursor(null, direction)
      cursor.onsuccess = () => {
        const c = cursor.result
        if (c) {
          const d = get(c.value)
          if(d !== undefined) return data = d as K
          c.continue()
        }
      }
      cursor.onerror = e => reject(e)
      tx.oncomplete = ()=> resolve(data)
      tx.onerror = e=> reject(e)
    })
  }
}


type ColumnDefinition<T> = {
  name: T
  unique?: boolean
}

type tableDefinition<T> = {
  [P in keyof T]: ColumnDefinition<keyof T[P]>[]
}

type DBTables<T> = {
  [P in keyof T]: TableStore<T[P]>
}


export class Database<T>{
  #tableDefinition:tableDefinition<T>
  #name: string
  #db: IDBDatabase
  tables : DBTables<T>
  constructor(name:string, tableDefinition:tableDefinition<T>){
    this.#name = name
    this.#tableDefinition = tableDefinition

    const self = this
    const handler = {
      get(target:any, prop:keyof T){
        if (!self.#db) throw new Error("Database is not opened");
            return new TableStore(prop as string, self.#db)
      }
    }

    this.tables = new Proxy({}, handler as ProxyHandler<{}>) as DBTables<T>
  }

  get name(){return this.#name}

  async open():Promise<void>{
    if(this.#db) return
    return new Promise((resolve, reject) =>{
        const request = indexedDB.open(this.#name)
        request.onupgradeneeded = () => {
          const db = request.result
          for (const table in this.#tableDefinition) {
              const obj = db.createObjectStore(table, { autoIncrement: true })
              for(const col of this.#tableDefinition[table]){
                obj.createIndex(col.name as unknown as string, col.name as unknown as string, col.unique? {unique:true}: {})
              }
          }
        }

        request.onerror = e=> reject(e)
      
          request.onsuccess = () => {
            this.#db = request.result
            resolve()
          }
    
          request.onerror = e => reject(e)      

    })
  }

  async close():Promise<void>{
    if(!this.#db) return
    const d = this.#db
    this.#db = undefined
    return d.close()
  }

  async delete():Promise<void> {
    if(this.#db)
    {
      await this.close()
    }
    return new Promise((resolve, reject)=>{
      const req = indexedDB.deleteDatabase(this.#name)
      req.onsuccess = ()=>resolve()
      req.onerror = e => reject(e)
    })
  }
}

type Primitive = string | number | boolean

function not<T>(f:T|Comparator<T>) {
  return isComparator(f)? (v:T)=>f(v) : (v:T)=>v===f
}

function is<T>(a:T){
  return (v:T)=>a===v
}

function equal<T>(a:T){
  return (v:T)=>a==v
}

function like(f:RegExp) {
  return (v:Primitive)=>f.test(`${v}`)
}

function lt<T = Primitive>(a:T){
  return (v:T)=>v<a
}

function lte<T = Primitive>(a:T){
  return (v:T)=>v<=a
}

function gt<T = Primitive>(a:T){
  return (v:T)=>v>a
}

function gte<T = Primitive>(a:T){
  return (v:T)=>v>=a
}

function between<T = Primitive>(a:T, b:T) {
    return (v:T)=>v>a&&v<b
}

function around<T = Primitive>(a:T, b:T) {
  return (v:T)=>v>=a&&v<=b
}

function xor<T = Primitive>(a:Comparator<T>, b:Comparator<T>) {
    return (v:T)=> a(v)===b(v)? false : true
}

function and<T = Primitive>(...f:Comparator<T>[]) {
  return (v:T)=> f.every(fun=>fun(v))
}

function or<T = Primitive>(...f:Comparator<T>[]) {
  return (v:T)=> f.some(fun=>fun(v))
}

export const q = {
  not,
  is,
  equal,
  like,
  between,
  around,
  lt,
  lte,
  gt,
  gte,
  or, 
  xor,
  and
}