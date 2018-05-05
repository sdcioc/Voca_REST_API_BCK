**Voca API**
----
  Returns json data about a number.

* **URL**

  api/mobile/:number

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**
 
   `number=[string]`


*  **Headers**

   **Required:**
 
   `api-key=[YOUR_API_KEY]`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{ status: "success", type : "scamer" , level : 3.4}`
 
* **Error Response:**

  * **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ status: "fail", message: "API KEY error"}`

* **Sample Call:**

  ```javascript
    $http.get(
        "mobile/" + "+40769261658",
        {
            headers : {
                "api-key": "YOUR_API_KEY"
            }
        }
    ).then(response => {
        return response.body;
    }, err => {
        console.log("err", err);
    }).then( response => {
        if(response.status == "success") {
            console.log("success querry")
            this.querryStatus = response;
        } else {
            console.log("err", response.message);
        }
    });
  ```
    ```curl
    curl --header "api-key: YOUR_API_KEY" http://server/api/mobile/:number
  ```