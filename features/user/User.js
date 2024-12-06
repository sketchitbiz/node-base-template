
export class User {

  /** @type {number} */
  id;

  /** @type {string} */
  name;

  /** @type {number} */
  age;

  /**
   * @param {Partial<User>} params
   */
  constructor({ name, age }) {
    this.name = name;
    this.age = age;
  }
}